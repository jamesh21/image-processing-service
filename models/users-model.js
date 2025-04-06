const pool = require('../services/db-service')

class UserModel {
    createNewUserInDB = async (email, password, fullName) => {
        const newUser = await pool.query('INSERT INTO users (email_address, password_hash, full_name) VALUES ($1, $2, $3) RETURNING *', [email, password, fullName])
        if (newUser.rowCount === 0) {
            // throw err
            console.error('Could not create new user')
        }
        return newUser.rows[0]
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
        return user.rows[0]
    }
}

module.exports = new UserModel()