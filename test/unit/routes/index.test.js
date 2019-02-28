'use strict'

const Test = require('tape')
const Sinon = require('sinon')
const Index = require('../../../src/routes')
const Handler = require('../../../src/routes/handler')

const assertRoute = (test, route, expected) => {
  test.equal(route.path, expected.path)
  test.equal(route.handler, expected.handler)
  test.equal(route.method, expected.method)
}

Test('routes module', async routesTest => {
  await routesTest.test('register should', async registerTest => {
    await registerTest.test('register routes with server', async function (test) {
      const routeSpy = Sinon.spy()
      const server = { route: routeSpy }

      await Index.plugin.register(server, {})
      test.ok(routeSpy.calledOnce)
      const routes = routeSpy.firstCall.args[0]
      assertRoute(test, routes[0], { method: 'GET', path: '/health', handler: Handler.health })
      assertRoute(test, routes[1], { method: 'GET', path: '/users', handler: Handler.getUsers })
      assertRoute(test, routes[2], { method: 'GET', path: '/users/{number}', handler: Handler.getUserByNumber })
      assertRoute(test, routes[3], { method: 'POST', path: '/register', handler: Handler.registerIdentifier })
      test.end()
    })
    registerTest.end()
  })
  routesTest.end()
})
