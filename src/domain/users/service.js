'use strict'

const Repo = require('./repo')
const AlreadyExistsError = require('../../errors/already-exists-error')

const register = async (payload) => {
  let existing = await getByNumber(payload.number)
  let duplicate = existing.find(f => {
    return f.dfspIdentifier === payload.dfspIdentifier
  })
  if (duplicate) {
    throw new AlreadyExistsError('The number has already been registered for this DFSP')
  }
  return Repo.create({ dfspIdentifier: payload.dfspIdentifier, number: payload.number })
}

const getAll = async () => {
  return Repo.getAll()
}

const getByNumber = async (number) => {
  return Repo.getByNumber(number)
}

module.exports = {
  register,
  getAll,
  getByNumber
}
