'use strict'

const Service = require('../domain/users/service')
const NotFoundError = require('@mojaloop/central-services-shared').NotFoundError

const usersResponse = (users) => {
  if (!users || users.length === 0) {
    throw new NotFoundError('The requested resource could not be found.')
  }
  return users.map(userResponse)
}

const userResponse = (user) => {
  return {
    number: user.number,
    dfspIdentifier: user.dfspIdentifier
  }
}

const getUsers = async function (request, h) {
  const users = await Service.getAll()
  return h.response(usersResponse(users))
}

const getUserByNumber = async function (request, h) {
  const users = await Service.getByNumber(request.params.number)
  return h.response(usersResponse(users))
}

const registerIdentifier = async function (request, h) {
  await Service.register(request.payload)
  const user = await Service.getByNumber(request.payload.number)
  return h.response(userResponse(user[0])).code(201)
}

const health = async function (request, h) {
  return h.response({ status: 'OK' })
}

module.exports = {
  getUsers,
  getUserByNumber,
  registerIdentifier,
  health
}
