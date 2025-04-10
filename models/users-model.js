const pool = require('../services/db-service')
const { DB_TO_API_MAPPING } = require('../constants/field-mapping-constant')
const { transformFields } = require('../utils/field-mapper-util')


class UserModel {
    createNewUserInDB = async (email, password, fullName) => {
        const newUser = await pool.query('INSERT INTO users (email_address, password_hash, full_name) VALUES ($1, $2, $3) RETURNING *', [email, password, fullName])
        if (newUser.rowCount === 0) {
            // throw err
            console.error('Could not create new user')
        }
        return transformFields(newUser.rows[0], DB_TO_API_MAPPING)
    }

    /**
     * Retrieves specific users from users table, This will also return hashed password.
     * @param {*} email 
     * @returns 
     */
    getUserFromDB = async (email) => {
        const user = await pool.query('SELECT * FROM users WHERE email_address = ($1)', [email])
        if (user.rowCount === 0) {
            throw new NotFoundError('User was not found')
        }
        return transformFields(user.rows[0], DB_TO_API_MAPPING)
    }
}

module.exports = new UserModel()