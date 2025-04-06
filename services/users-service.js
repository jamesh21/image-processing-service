const userModel = require('../models/users-model')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");

class UserService {
    register = async (email, password, fullName) => {
        // need to hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        // need to create token
        const user = await userModel.createNewUserInDB(email, hashedPassword, fullName)
        return this.buildAuthResponse(user)
    }

    login = async (email, password) => {
        const user = await userModel.getUserFromDB(email)
        console.log(user)
        const passwordMatch = await this.comparePassword(password, user.password_hash)

        if (!passwordMatch) {
            throw new Error('incorrect password')
        }
        // need to create token
        return this.buildAuthResponse(user)

    }


    comparePassword = (password, hashedPassword) => {
        return bcrypt.compare(password, hashedPassword)
    }

    buildAuthResponse = (user) => {
        const token = jwt.sign(
            {
                email: user.email_address,
                name: user.full_name,
                id: user.user_id
            }, process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_LIFETIME
            }
        )

        return {
            user:
            {
                name: user.full_name,
                email: user.email_address,
                id: user.user_id
            },
            token
        }
    }
}

module.exports = new UserService()