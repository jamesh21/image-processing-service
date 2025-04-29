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
    getUserFromDB = async (email) => {
        try {
            const user = await pool.query(`SELECT * FROM ${UserModel.tableName} WHERE email_address = ($1)`, [email])
            return UserModel.fromDb(user.rows[0])
        } catch (err) {
            throw DatabaseErrorHandler.handle(err)
        }
    }
}

module.exports = new UserRepository()