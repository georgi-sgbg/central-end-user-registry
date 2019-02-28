'use strict'

exports.up = async (knex, Promise) => {
  return await knex.schema.hasTable('users').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('users', (t) => {
        t.increments('id').primary()
        t.string('number', 8).notNullable()
        t.string('dfspIdentifier', 256).notNullable()
        t.timestamp('createdDate').notNullable().defaultTo(knex.fn.now())
      })
    }
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('users')
}
