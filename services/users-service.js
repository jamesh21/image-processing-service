const userRepository = require('../repository/users-repository')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");
const { BadRequestError, UnauthenticatedError } = require('../errors')

class UserService {
    register = async (email, password, fullName) => {
        if (!email || !password || !fullName) {
            throw new BadRequestError('Email, password, or name was not provided')
        }
        // need to hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        // need to create token
        const user = await userRepository.createNewUserInDB({ email, password: hashedPassword, name: fullName })

        return this.buildAuthResponse(user)
    }

    login = async (email, password) => {
        if (!email || !password) {
            throw new BadRequestError('Email or password was not provided')
        }
        const user = await userRepository.getUserFromDB(email)

        const passwordMatch = await this.comparePassword(password, user.password)

        if (!passwordMatch) {
            throw new UnauthenticatedError('Incorrect password')
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
                email: user.email,
                name: user.name,
                id: user.userId
            }, process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_LIFETIME
            }
        )

        return {
            user:
            {
                name: user.name,
                email: user.email,
                id: user.userId
            },
            token
        }
    }
}

module.exports = new UserService()