>&2 echo "--==== Integration Tests Runner ====--"

if [ $# -ne 1 ]; then 
    echo ""
    echo "Usage: $0 {env-file}" 
    echo "{env-file} must contain the following variables:"
    echo " - DOCKER_IMAGE: Name of Image"
    echo " - DOCKER_TAG: Tag/Version of Image"
    echo " - DOCKER_FILE: Recipe to be used for Docker build"
    echo " - DOCKER_WORKING_DIR: Docker working directory"
    echo " - MYSQL_USER: MySQL user"
    echo " - MYSQL_PASSWORD: MySQL password"
    echo " - MYSQL_HOST: MySQL host name"
    echo " - MYSQL_PORT: MySQL container port"
    echo " - MYSQL_DATABASE: MySQL database"
    echo " - MYSQL_IMAGE: Docker Image for MySQL"
    echo " - MYSQL_TAG: Docker tag/version for MySQL"
    echo " - APP_HOST: Application host name"
    echo " - APP_DIR_TEST_RESULTS: Location of test results relative to the working directory"
    echo " - TEST_CMD: Interation test command to be executed"
    echo ""
    echo " * IMPORTANT: Ensure you have the required env in the test/.env to execute the application"
    echo ""
    exit 1 
fi
>&2 echo ""
>&2 echo "====== Loading environment variables ======"
cat $1
. $1
>&2 echo "==========================================="
>&2 echo ""

>&2 echo "Executing Integration Tests for $APP_HOST ..."

>&2 echo "Creating local directory to store test results"
mkdir -p test/results

fdb() {
    docker run -it --rm \
    --link $MYSQL_HOST:mysql \
    -e MYSQL_HOST=$MYSQL_HOST \
    -e MYSQL_PORT=$MYSQL_PORT \
    -e MYSQL_PASSWORD=$MYSQL_PASSWORD \
    -e MYSQL_USER=$MYSQL_USER \
    -e MYSQL_DATABASE=$MYSQL_DATABASE \
    -e MYSQL_ALLOW_EMPTY_PASSWORD=true \
    mysql \
    sh -c \
    "$@"
}

ftest() {
	docker run --rm -i \
    --link $MYSQL_HOST \
    --env MYSQL_USER="$MYSQL_USER" \
    --env MYSQL_PASSWORD="$MYSQL_PASSWORD" \
    --env MYSQL_HOST="$MYSQL_HOST" \
    --env MYSQL_PORT="$MYSQL_PORT" \
    --env MYSQL_DATABASE="$MYSQL_DATABASE" \
		"$DOCKER_IMAGE:$DOCKER_TAG" \
    /bin/sh \
    -c \
    "$@"
}

is_db_up() {
    fdb 'mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "select 1"' > /dev/null 2>&1
}

stop_docker() {
  >&2 echo "MySQL-int is shutting down $MYSQL_HOST"
  (docker stop $MYSQL_HOST && docker rm $MYSQL_HOST) > /dev/null 2>&1
  >&2 echo "$APP_HOST environment is shutting down"
  (docker stop $APP_HOST && docker rm $APP_HOST) > /dev/null 2>&1
}

clean_docker() {
  stop_docker
  >&2 echo "Removing docker test image $DOCKER_IMAGE:$DOCKER_TAG"
  (docker rmi $DOCKER_IMAGE:$DOCKER_TAG) > /dev/null 2>&1
}

run_test_command()
{
  >&2 echo "Running $APP_HOST Test command: $TEST_CMD"
  docker run -i \
    --link $MYSQL_HOST \
    --name $APP_HOST \
    --env MYSQL_USER="$MYSQL_USER" \
    --env MYSQL_PASSWORD="$MYSQL_PASSWORD" \
    --env MYSQL_HOST="$MYSQL_HOST" \
    --env MYSQL_PORT="$MYSQL_PORT" \
    --env MYSQL_DATABASE="$MYSQL_DATABASE" \
		$DOCKER_IMAGE:$DOCKER_TAG \
    /bin/sh \
    -c "source test/.env; $TEST_CMD"
}

>&2 echo "Building Docker Image $DOCKER_IMAGE:$DOCKER_TAG with $DOCKER_FILE"
docker build --no-cache -t $DOCKER_IMAGE:$DOCKER_TAG -f $DOCKER_FILE .

if [ "$?" != 0 ]
then
  >&2 echo "Build failed...exiting"
  clean_docker
  exit 1
fi

>&2 echo "MySQL is starting"
stop_docker

docker run --name $MYSQL_HOST -d -p $MYSQL_PORT:$MYSQL_PORT -e MYSQL_PASSWORD=$MYSQL_PASSWORD -e MYSQL_USER=$MYSQL_USER -e MYSQL_DATABASE=$MYSQL_DATABASE -e MYSQL_ALLOW_EMPTY_PASSWORD=true $MYSQL_IMAGE:$MYSQL_TAG > /dev/null 2>&1

if [ "$?" != 0 ]
then
  >&2 echo "Starting MySQL failed...exiting"
  clean_docker
  exit 1
fi

until is_db_up; do
  >&2 echo "MySQL is unavailable - sleeping"
  sleep 1
done

>&2 echo "Running migrations"
ftest "source test/.env; npm run migrate"

if [ "$?" != 0 ]
then
  >&2 echo "Migration failed...exiting"
  clean_docker
  exit 1
fi

>&2 echo "Integration tests are starting"
run_test_command
test_exit_code=$?

if [ "$test_exit_code" != 0 ]
then
  >&2 echo "Integration tests failed...exiting"
  >&2 echo "Test environment logs..."
  docker logs $APP_HOST
  clean_docker
  exit 1
fi

>&2 echo "Copy results to local directory"
docker cp $APP_HOST:$DOCKER_WORKING_DIR/$APP_DIR_TEST_RESULTS test

clean_docker

exit "$test_exit_code"
