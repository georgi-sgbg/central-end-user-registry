'use strict'

const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const P = require('bluebird')
const NotFoundError = require('@mojaloop/central-services-shared').NotFoundError

const Handler = require('../../../src/routes/handler')
const Service = require('../../../src/domain/users/service')

Test('routes handler test', async handlerTest => {
  let sandbox

  handlerTest.beforeEach(test => {
    sandbox = Sinon.createSandbox()
    sandbox.stub(Service)
    test.end()
  })

  handlerTest.afterEach(test => {
    sandbox.restore()
    test.end()
  })

  await handlerTest.test('health should', async healthTest => {
    await healthTest.test('return status: OK', async function (test) {
      const h = {
        response: (output) => {
          test.equal(output.status, 'OK')
          test.end()
        }
      }
      await Handler.health({}, h)
    })

    healthTest.end()
  })

  await handlerTest.test('getUsers should', async getUsersTest => {
    await getUsersTest.test('returns users from Service', async function (test) {
      const number = '12345678'
      const dfspIdentifier = '001:123'
      const user = { id: 1, number, dfspIdentifier }
      await Service.getAll.returns(P.resolve([user]))

      const h = {
        response: (output) => {
          test.deepEqual(output, [{ number, dfspIdentifier }])
          test.end()
        }
      }

      await Handler.getUsers({}, h)
    })
    getUsersTest.end()
  })

  await handlerTest.test('getUserByNumber should', async userByNumberTest => {
    await userByNumberTest.test('return user from Service.getByNumber', async function (test) {
      const number = '12345678'
      const dfspIdentifier = '001:123'
      const user = { id: 1, number, dfspIdentifier }
      await Service.getByNumber.returns(P.resolve([user]))

      const request = {
        params: { number }
      }
      const h = {
        response: (output) => {
          test.equal(1, output.length)
          test.deepEqual(output[0], { number, dfspIdentifier })
          test.end()
        }
      }

      await Handler.getUserByNumber(request, h)
    })

    await userByNumberTest.test('return NotFoundError if users is null', async function (test) {
      const number = '12345678'
      await Service.getByNumber.returns(P.resolve(null))

      const request = {
        params: { number }
      }
      const h = {}

      try {
        await Handler.getUserByNumber(request, h)
      } catch (err) {
        test.ok(err instanceof NotFoundError)
        test.equal(err.message, 'The requested resource could not be found.')
        test.end()
      }
    })

    await userByNumberTest.test('return NotFoundError if users is empty', async function (test) {
      const number = '12345678'
      await Service.getByNumber.returns(P.resolve([]))

      const request = {
        params: { number }
      }
      const h = {}

      try {
        await Handler.getUserByNumber(request, h)
      } catch (err) {
        test.ok(err instanceof NotFoundError)
        test.equal(err.message, 'The requested resource could not be found.')
        test.end()
      }
    })

    userByNumberTest.end()
  })

  await handlerTest.test('registerIdentifier should', async registerIdentifierTest => {
    await registerIdentifierTest.test('register user with Service', async function (test) {
      const number = '12345678'
      const dfspIdentifier = '001:123'
      const user = { id: 2, dfspIdentifier, number }
      const requestedUser = [
        {
          number,
          dfspIdentifier
        }
      ]

      await Service.register.withArgs(Sinon.match({ number, dfspIdentifier })).returns(P.resolve(user))
      Service.getByNumber.withArgs(number).returns(requestedUser)

      const request = {
        payload: { number, dfspIdentifier }
      }
      const h = {
        response: (output) => {
          test.deepEqual(output, { number, dfspIdentifier })
          return {
            code: (statusCode) => {
              test.equal(statusCode, 201)
              test.end()
            }
          }
        }
      }

      await Handler.registerIdentifier(request, h)
    })

    await registerIdentifierTest.test('throw NotFoundException if directory yields empty', async function (test) {
      const number = '12345678'
      const dfspIdentifier = '001:123'

      let error = new Error()
      await Service.register.withArgs(Sinon.match({ number, dfspIdentifier })).returns(P.reject(error))

      const request = {
        payload: { number, dfspIdentifier }
      }
      let h = {}

      try {
        await Handler.registerIdentifier(request, h.response)
      } catch (err) {
        test.equal(err, error)
        test.end()
      }
    })

    registerIdentifierTest.end()
  })

  handlerTest.end()
})
