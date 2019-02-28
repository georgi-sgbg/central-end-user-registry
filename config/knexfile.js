'use strict'

const Config = require('../src/lib/config')
const migrationsDirectory = '../migrations'

module.exports = {
  client: 'mysql',
  connection: Config.DATABASE_URI,
  migrations: {
    directory: migrationsDirectory,
    tableName: 'migration',
    stub: `${migrationsDirectory}/migration.template`
  }
}
