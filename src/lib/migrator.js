'use strict'

const Path = require('path')
const Migrations = require('@mojaloop/central-services-database').Migrations
const Knexfile = require('../../config/knexfile')

exports.migrate = async function () {
  return Migrations.migrate(updateMigrationsLocation(Knexfile))
}

const updateMigrationsLocation = (kf) => {
  const parsed = Path.parse(kf.migrations.directory)
  kf.migrations.directory = Path.join(process.cwd(), parsed.base)
  return kf
}
