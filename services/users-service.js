const userRepository = require('../repository/users-repository')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors')

class UserService {

    /**
     * Registers a user by calling user repository to create an entry in DB with the passed in user info
     * @param {*} email 
     * @param {*} password 
     * @param {*} fullName 
     * @returns a response containing user information and auth token
     */
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

    /**
     * Attempts to login user with passed in email and password.
     * @param {*} email 
     * @param {*} password 
     * @returns if successful, user information and auth token is returned.
     */
    login = async (email, password) => {
        if (!email || !password) {
            throw new BadRequestError('Email or password was not provided')
        }
        const user = await userRepository.getUserFromDB({ email })

        if (!user) {
            throw new NotFoundError('User was not found')
        }
        const passwordMatch = await this.comparePassword(password, user.password)

        if (!passwordMatch) {
            throw new UnauthenticatedError('Incorrect password')
        }
        // need to create token
        return this.buildAuthResponse(user)

    }

    /**
     * Helper function for comparing passwords
     * @param {*} password 
     * @param {*} hashedPassword 
     * @returns boolean if password is correct
     */
    comparePassword = (password, hashedPassword) => {
        return bcrypt.compare(password, hashedPassword)
    }

    /**
     * Helper function for building response for new user or logged in user.
     * @param {*} user 
     * @returns an object containng auth token and user information.
     */
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