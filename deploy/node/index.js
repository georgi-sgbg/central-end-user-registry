'use strict'

const Aws = require('./aws')
const Ecr = require('./ecr')
const Ecs = require('./ecs')
const Jfrog = require('./jfrog')
const Variables = require('./variables')

const pushService = ({ IMAGE, NAME, PORT }, version) => {
  const databaseUri = `mysql://${Variables.MYSQL_USER}:${Variables.MYSQL_PASSWORD}@${Variables.MYSQL_HOST}:3306/central_end_user_registry`
  const envVariables = [
    {
      name: 'CREG_DATABASE_URI',
      value: databaseUri
    },
    {
      name: 'CREG_HOSTNAME',
      value: Variables.HOSTNAME
    }
  ]
  const serviceName = `${NAME}-${Variables.ENVIRONMENT}`
  return Ecr.pushImageToEcr(IMAGE, version)
    .then(result => Ecs.registerTaskDefinition(serviceName, result.versioned, PORT, envVariables))
    .then(taskDefinition => Ecs.deployService(Variables.CLUSTER, serviceName, taskDefinition))
}

const deploy = () => {
  const version = Variables.VERSION
  Aws.configureAws()
    .then(() => pushService(Variables.API, version))
    .then(() => Jfrog.login())
    .then(() => Jfrog.pushImageToJFrog(Variables.API.IMAGE, version))
    .catch(e => {
      console.error(e)
      process.exit(1)
    })
}

module.exports = deploy()
