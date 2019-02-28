'use strict'

const P = require('bluebird')
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Db = require('../../src/db')
const Glue = require('glue')
const Logger = require('@mojaloop/central-services-shared').Logger
const Config = require('../../src/lib/config')
const Migrator = require('../../src/lib/migrator')

Test('server', async serverTest => {
  let sandbox
  let oldDatabaseUri
  let databaseUri = 'some-database-uri'

  serverTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    sandbox.stub(Db, 'connect')
    sandbox.stub(Glue, 'compose')
    sandbox.stub(Logger, 'info')
    sandbox.stub(Logger, 'error')
    sandbox.stub(Migrator, 'migrate')

    oldDatabaseUri = Config.DATABASE_URI
    Config.DATABASE_URI = databaseUri

    t.end()
  })

  serverTest.afterEach(t => {
    delete require.cache[require.resolve('../../src/server')]
    sandbox.restore()
    Config.DATABASE_URI = oldDatabaseUri
    t.end()
  })

  await serverTest.test('exporting should', async (exportingTest) => {
    let serverUri = 'http://central-end-user-registry'

    await exportingTest.test('run all required actions when starting server', async test => {
      let startStub = sandbox.stub().returns(P.resolve({}))
      let server = { start: startStub, info: { uri: serverUri } }

      Glue.compose.returns(P.resolve(server))
      Db.connect.returns(P.resolve({}))
      Migrator.migrate.returns(P.resolve({}))

      await require('../../src/server')
      test.ok(Migrator.migrate.calledOnce)
      test.ok(Db.connect.calledOnce)
      test.ok(Db.connect.calledWith(databaseUri))
      test.ok(Glue.compose.calledOnce)
      test.ok(startStub.calledOnce)
      test.ok(Logger.info.calledOnce)
      test.ok(Logger.info.calledWith(`Server running at: ${serverUri}`))
      test.end()
    })

    await exportingTest.test('log any errors', async test => {
      let error = new Error()
      Migrator.migrate.returns(P.reject(error))
      try {
        await require('../../src/server')
      } catch (e) {
        test.equal(e, error)
        test.ok(Logger.error.calledWith(error))
        test.end()
      }
    })

    exportingTest.end()
  })

  serverTest.end()
})
