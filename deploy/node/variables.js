const environment = process.env.ENVIRONMENT || 'TEST'

module.exports = {
  AWS_ACCOUNT_ID: process.env.AWS_ACCOUNT_ID || 886403637725,
  APP_NAME: process.env.APP_NAME || 'central-end-user-registry',
  AWS_REGION: process.env.AWS_REGION || 'us-west-2',
  ENVIRONMENT: environment,
  VERSION: process.env.CIRCLE_TAG || process.env.CIRCLE_BRANCH + '-' + process.env.CIRCLE_BUILD_NUM,
  API: {
    NAME: 'central-end-user-registry',
    IMAGE: process.env.API_IMAGE || 'leveloneproject/central-end-user-registry',
    PORT: process.env.API_PORT || 3001
  },
  CLUSTER: process.env.CLUSTER || 'central-services-' + environment,
  DOCKER_EMAIL: process.env.DOCKER_EMAIL,
  DOCKER_USER: process.env.DOCKER_USER,
  DOCKER_PASS: process.env.DOCKER_PASS,
  HOSTNAME: process.env.HOSTNAME || 'http://central-end-user-registry-TEST-1765383584.us-west-2.elb.amazonaws.com',
  JFROG_REPO: process.env.JFROG_REPO || 'modusbox-level1-docker-release.jfrog.io',
  MYSQL_USER: process.env.DEV_MYSQL_USER,
  MYSQL_PASSWORD: process.env.DEV_MYSQL_PASSWORD,
  MYSQL_HOST: process.env.DEV_MYSQL_HOST
}
