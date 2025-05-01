const pool = require('../services/db-service')
const { DB_DUP_ENTRY } = require('../constants/errors-constant')
const { DuplicateRecordError } = require('../errors')
const DatabaseErrorHandler = require('../utils/database-error-handler')

const UserModel = require('..//models/users-model')

class UserRepository {
    createNewUserInDB = async (user) => {

        try {
            const dbUser = UserModel.toDb(user)
            const columnNames = Object.keys(dbUser).join(', ')
            const values = Object.values(dbUser)
            const placeholder = values.map((_, index) => `$${index + 1}`).join(', ')
            const query = `INSERT INTO ${UserModel.tableName} (${columnNames}) VALUES (${placeholder}) RETURNING *`
            const newUser = await pool.query(query, values)

            return UserModel.fromDb(newUser.rows[0])
        } catch (err) {
            if (err.code === DB_DUP_ENTRY) {
                throw new DuplicateRecordError('Email already exists')
            }
            throw DatabaseErrorHandler.handle(err)
        }

    }

    /**
     * Retrieves specific users from users table, This will also return hashed password.
     * @param {*} email 
     * @returns 
     */
    getUserFromDB = async (criteria) => {
        try {
            const searchCriteria = UserModel.toDb(criteria)
            const whereClause = `${Object.keys(searchCriteria)[0]} = ($1)`
            const query = `SELECT * FROM ${UserModel.tableName} WHERE ${whereClause}`
            const user = await pool.query(query, [Object.values(searchCriteria)[0]])
            return UserModel.fromDb(user.rows[0])
        } catch (err) {
            throw DatabaseErrorHandler.handle(err)
        }
    }
}

module.exports = new UserRepository()