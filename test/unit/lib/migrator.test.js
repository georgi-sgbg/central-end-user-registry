'use strict'

const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const P = require('bluebird')
const Path = require('path')
const Migrations = require('@mojaloop/central-services-database').Migrations
const Proxyquire = require('proxyquire')

Test('migrator', async migratorTest => {
  let sandbox
  let configuredMigrationsFolder
  let Migrator

  migratorTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    sandbox.stub(Migrations)

    configuredMigrationsFolder = 'migrations-path'

    Migrator = Proxyquire('../../../src/lib/migrator', { '../../config/knexfile': { migrations: { directory: `../${configuredMigrationsFolder}` } } })

    t.end()
  })

  migratorTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  await migratorTest.test('migrate should', async migrateTest => {
    await migrateTest.test('override migrations directory path and run migrations', async test => {
      try {
        Migrations.migrate.returns(P.resolve())
        let updatedMigrationsPath = Path.join(process.cwd(), configuredMigrationsFolder)
        await Migrator.migrate()
        test.ok(Migrations.migrate.calledOnce)
        test.ok(Migrations.migrate.firstCall.args[0].migrations.directory, updatedMigrationsPath)
        test.end()
      } catch (e) {
        test.fail()
        test.end()
      }
    })

    migrateTest.end()
  })

  migratorTest.end()
})
