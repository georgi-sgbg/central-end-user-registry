'use strict'

const Db = require('../../db')

exports.getAll = async () => {
  return Db.users.find({}, { order: 'number asc' })
}

exports.getByNumber = async (number) => {
  return Db.users.find({ number }, { order: 'dfspIdentifier asc' })
}
exports.create = async (user) => {
  return Db.users.insert(user)
}
