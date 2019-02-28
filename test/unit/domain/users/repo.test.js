'use strict'

const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const P = require('bluebird')
const Repo = require('../../../../src/domain/users/repo')
const Db = require('../../../../src/db')

Test('User Repo test', async repoTest => {
  let sandbox

  repoTest.beforeEach(test => {
    sandbox = Sinon.createSandbox()

    Db.users = {
      insert: sandbox.stub(),
      findOne: sandbox.stub(),
      find: sandbox.stub()
    }

    test.end()
  })

  repoTest.afterEach(test => {
    sandbox.restore()
    test.end()
  })

  await repoTest.test('getByNumber should', async getByNumberTest => {
    await getByNumberTest.test('find one user by number', async test => {
      try {
        const number = '12345678'
        Db.users.find.returns(P.resolve([{ number }]))
        let response = await Repo.getByNumber(number)
        test.equal(1, response.length)
        test.equal(response[0].number, number)
        test.ok(Db.users.find.calledWith(Sinon.match({ number }), { order: 'dfspIdentifier asc' }))
        test.end()
      } catch (e) {
        test.fail()
        test.end()
      }
    })

    getByNumberTest.end()
  })

  await repoTest.test('getAll should', async getAllTest => {
    await getAllTest.test('get all users and order by number', async test => {
      try {
        const number1 = '12345678'
        const number2 = '12345679'

        Db.users.find.returns(P.resolve([{ number: number1 }, { number: number2 }]))

        let response = await Repo.getAll()
        test.equal(response.length, 2)
        test.equal(response[0].number, number1)
        test.equal(response[1].number, number2)
        test.ok(Db.users.find.calledWith({}, { order: 'number asc' }))
        test.end()
      } catch (e) {
        test.fail()
        test.end()
      }
    })

    getAllTest.end()
  })

  await repoTest.test('create should', async createTest => {
    await createTest.test('insert user', async test => {
      try {
        const user = { url: 'test', number: 'test' }
        Db.users.insert.returns(P.resolve(user))

        await Repo.create(user)

        test.ok(Db.users.insert.calledWith(user))
        test.end()
      } catch (e) {
        test.fail()
        test.end()
      }
    })

    createTest.end()
  })

  repoTest.end()
})
