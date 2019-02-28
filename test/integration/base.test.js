'use strict'

const Test = require('tape')
const Db = require('../../src/db')
const Config = require('../../src/lib/config')

Test('setup', async setupTest => {
  await setupTest.test('connect to database', async test => {
    await Db.connect(Config.DATABASE_URI)
    test.pass()
    test.end()
  })
  setupTest.end()
})

Test.onFinish(function () {
  Db.disconnect()
})
