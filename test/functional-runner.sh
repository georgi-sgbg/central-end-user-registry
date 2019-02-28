>&2 echo "--==== Functional Tests Runner ====--"

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
    echo " - TEST_CMD: Functional test command to be executed"
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

>&2 echo "Executing Functional Tests for $APP_HOST ..."

>&2 echo "Creating local directory to store test results"
mkdir -p test/results

fsql() {
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

is_db_up() {
    fsql 'mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "select 1"' > /dev/null 2>&1
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

stop_docker() {
  >&2 echo "MySQL-functional is shutting down $MYSQL_HOST"
  (docker stop $MYSQL_HOST && docker rm $MYSQL_HOST) > /dev/null 2>&1
  >&2 echo "$APP_HOST environment is shutting down"
  (docker stop $APP_HOST && docker rm $APP_HOST) > /dev/null 2>&1
  (docker stop $APP_TEST_HOST && docker rm $APP_TEST_HOST) > /dev/null 2>&1
}

clean_docker() {
  stop_docker
  >&2 echo "Removing docker test image $DOCKER_IMAGE:$DOCKER_TAG"
  (docker rmi $DOCKER_IMAGE:$DOCKER_TAG) > /dev/null 2>&1
}

fcurl() {
	docker run --rm -i \
		--link $APP_HOST \
    --entrypoint curl \
    "jlekie/curl:latest" \
    --silent --head --fail \
		"$@"
}

is_api_up() {
    fcurl "http://$APP_HOST:3001/health?"
}

run_test_command()
{
  echo "mysql://$MYSQL_USER:$MYSQL_PASSWORD@$MYSQL_HOST:$MYSQL_PORT/$MYSQL_DATABASE"

  >&2 echo "Running $APP_HOST Test command: $TEST_CMD"
  docker run -i \
    --link $APP_HOST \
    --link $MYSQL_HOST \
    --name $APP_TEST_HOST \
    --env HOST_IP="$APP_HOST" \
    --env CREG_DATABASE_URI="mysql://$MYSQL_USER:$MYSQL_PASSWORD@$MYSQL_HOST:$MYSQL_PORT/$MYSQL_DATABASE" \
    $DOCKER_IMAGE:$DOCKER_TAG \
    /bin/sh \
    -c "source test/.env; $TEST_CMD"
}

start_central_registry () {
  docker run -d -i \
    --link $MYSQL_HOST \
    --name $APP_HOST \
    --env MYSQL_USER="$MYSQL_USER" \
    --env MYSQL_PASSWORD="$MYSQL_PASSWORD" \
    --env MYSQL_HOST="$MYSQL_HOST" \
    --env MYSQL_PORT="$MYSQL_PORT" \
    --env MYSQL_DATABASE="$MYSQL_DATABASE" \
    -p $APP_PORT:$APP_PORT \
		$DOCKER_IMAGE:$DOCKER_TAG \
    /bin/sh \
    -c "source test/.env; $APP_CMD"
}

# Script execution

>&2 echo "Building Docker Image $DOCKER_IMAGE:$DOCKER_TAG with $DOCKER_FILE"
docker build --no-cache -t $DOCKER_IMAGE:$DOCKER_TAG -f $DOCKER_FILE .
echo "result "$?""
if [ "$?" != 0 ]
then
  >&2 echo "Build failed...exiting"
  clean_docker
  exit 1
fi

stop_docker
>&2 echo "mysql is starting"
docker run --name $MYSQL_HOST -d -p $MYSQL_PORT:$MYSQL_PORT -e MYSQL_PASSWORD=$MYSQL_PASSWORD -e MYSQL_USER=$MYSQL_USER -e MYSQL_DATABASE=$MYSQL_DATABASE -e MYSQL_ALLOW_EMPTY_PASSWORD=true $MYSQL_IMAGE:$MYSQL_TAG > /dev/null 2>&1

if [ "$?" != 0 ]
then
  >&2 echo "Starting mysql failed...exiting"
  clean_docker
  exit 1
fi

until is_db_up; do
  >&2 echo "mysql is unavailable - sleeping"
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

>&2 printf "Central-end-user-registry is starting: "
start_central_registry

>&2 printf "Starting up..."
until is_api_up; do
  >&2 printf "."
  sleep 5
done

>&2 echo "Functional tests are starting"
run_test_command

test_exit_code=$?

>&2 echo "Displaying test logs"
docker logs $APP_TEST_HOST

>&2 echo "Copy results to local directory"
docker cp $APP_TEST_HOST:$DOCKER_WORKING_DIR/$APP_DIR_TEST_RESULTS test

if [ "$test_exit_code" != 0 ]
then
  >&2 echo "Functional tests failed...exiting"
  >&2 echo "Test environment logs..."
fi

clean_docker
exit "$test_exit_code"
