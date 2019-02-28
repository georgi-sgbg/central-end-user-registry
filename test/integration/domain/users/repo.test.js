'use strict'

const Test = require('tape')
const Db = require('../../../../src/db')
const Repo = require('../../../../src/domain/users/repo')
const Config = require('../../../../src/lib/config')

function createUser (number, dfspIdentifier) {
  return Repo.create({ dfspIdentifier, number })
}

function deleteUsers () {
  return Db.from('users').destroy()
}

Test('users repo', async repoTest => {
  await Db.connect(Config.DATABASE_URI)
  const number = Math.floor(Math.random() * 100000000)
  const dfspIdentifier = '001:123'
  let id

  await repoTest.test('create should', async createTest => {
    await createTest.test('create a new user', async test => {
      let userId = await createUser(number.toString(), dfspIdentifier)
      test.ok(userId, 'returned ID of created user')
      id = userId
      test.end()
    })

    createTest.end()
  })

  await repoTest.test('getByNumber should', async getByNumberTest => {
    await getByNumberTest.test('get user by number', async test => {
      let numberString = number.toString()
      let foundNumbers = await Repo.getByNumber(numberString)
      test.ok(foundNumbers)
      test.equal(1, foundNumbers.length)
      let found = foundNumbers[0]
      test.equal(found.id, id)
      test.equal(found.number, numberString)
      test.equal(found.dfspIdentifier, dfspIdentifier)
      test.ok(found.createdDate)
      test.end()
    })

    await getByNumberTest.test('return multiple records for number and order by dfspIdentifier ascending', async test => {
      const dfspIdentifier2 = '001:122'

      await createUser(number, dfspIdentifier2)
      let found = await Repo.getByNumber(number)
      test.equal(2, found.length)
      test.equal(dfspIdentifier2, found[0].dfspIdentifier)
      test.equal(dfspIdentifier, found[1].dfspIdentifier)
      test.end()
    })

    getByNumberTest.end()
  })

  await repoTest.test('getAll should', async getAllTest => {
    await getAllTest.test('return all users and order by number ascending', async test => {
      const user1Number = number.toString()
      const user1DfspIdentifier = '001:125'
      const user2Number = (number + 1).toString()
      const user2DfspIdentifier = '001:126'

      await deleteUsers()
      await createUser(user1Number, user1DfspIdentifier)
      await createUser(user2Number, user2DfspIdentifier)
      let users = await Repo.getAll()
      test.equal(users.length, 2)
      test.equal(users[0].number, user1Number)
      test.equal(users[0].dfspIdentifier, user1DfspIdentifier)
      test.equal(users[1].number, user2Number)
      test.equal(users[1].dfspIdentifier, user2DfspIdentifier)
      test.end()
    })

    getAllTest.end()
  })

  await repoTest.test('disconnect DB', async test => {
    Db.disconnect()
    test.end()
  })
  repoTest.end()
})
