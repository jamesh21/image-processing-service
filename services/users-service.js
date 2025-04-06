const userModel = require('../models/users-model')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");

class UserService {
    register = async (email, password, fullName) => {
        // need to hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        return userModel.createNewUserInDB(email, hashedPassword, fullName)
    }

    login = async (email, password) => {
        const user = await userModel.getUserFromDB(email)

    }
}

module.exports = new UserService()