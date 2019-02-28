'use strict'

const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const P = require('bluebird')
const Repo = require('../../../../src/domain/users/repo')
const Service = require('../../../../src/domain/users/service')
const AlreadyExistsError = require('../../../../src/errors/already-exists-error')

Test('users service tests', async serviceTest => {
  let sandbox

  serviceTest.beforeEach(t => {
    sandbox = Sinon.createSandbox()
    sandbox.stub(Repo)
    t.end()
  })

  serviceTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  await serviceTest.test('getByNumber should', async getByNumberTest => {
    await getByNumberTest.test('get user from repo by number', async test => {
      try {
        const number = '12345678'
        const user = { number }
        Repo.getByNumber.returns(P.resolve(user))
        let result = await Service.getByNumber(number)
        test.equal(result, user)
        test.ok(Repo.getByNumber.calledWith(number))
        test.end()
      } catch (e) {
        test.fail()
        test.end()
      }
    })

    getByNumberTest.end()
  })

  await serviceTest.test('getAll should', async getAllTest => {
    await getAllTest.test('get users from repo', async test => {
      try {
        const number = '12345678'
        const user = { number }
        Repo.getAll.returns(P.resolve([user]))

        let result = await Service.getAll()
        test.equal(result[0], user)
        test.ok(Repo.getAll.called)
        test.end()
      } catch (e) {
        test.fail()
        test.end()
      }
    })

    getAllTest.end()
  })

  await serviceTest.test('register should', async registerTest => {
    await registerTest.test('register number', async test => {
      try {
        const dfspIdentifier = '001:123'
        const number = '12345'
        const expected = { number, dfspIdentifier }
        Repo.create.returns(P.resolve(expected))
        Repo.getByNumber.returns(P.resolve([]))

        let result = await Service.register({ number, dfspIdentifier })
        test.equal(result, expected)
        test.equal(Repo.create.callCount, 1)
        test.end()
      } catch (e) {
        test.fail()
        test.end()
      }
    })

    await registerTest.test('throw AlreadyExistsError if number already registered for same DFSP', async test => {
      try {
        const dfspIdentifier = '001:123'
        const number = '12345'

        const expected = { number, dfspIdentifier }
        Repo.getByNumber.returns([expected])
        Repo.create.returns(P.resolve(expected))

        await Service.register({ number, dfspIdentifier })
        test.fail('Expected exception to be thrown')
        test.end()
      } catch (e) {
        test.ok(e instanceof AlreadyExistsError)
        test.equal(e.message, 'The number has already been registered for this DFSP')
        test.end()
      }
    })

    registerTest.end()
  })

  serviceTest.end()
})
