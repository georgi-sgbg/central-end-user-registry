'use strict'

const Glue = require('glue')
const Manifest = require('./manifest')
const Db = require('./db')
const Logger = require('@mojaloop/central-services-shared').Logger
const Config = require('./lib/config')
const Migrator = require('./lib/migrator')

const composeOptions = { relativeTo: __dirname }

const Setup = async () => {
  try {
    await Migrator.migrate()
    await Db.connect(Config.DATABASE_URI)
    let server = await Glue.compose(Manifest, composeOptions)
    await server.start()
    Logger.info(`Server running at: ${server.info.uri}`)
  } catch (err) {
    Logger.error(err)
    throw err
  }
}

module.exports = Setup()
