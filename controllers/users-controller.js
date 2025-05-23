const { StatusCodes } = require('http-status-codes')
const usersService = require('../services/users-service')


const login = async (req, res) => {
    const { email, password } = req.body
    const userTokenInfo = await usersService.login(email, password)

    return res.status(StatusCodes.OK).json(userTokenInfo)
}

const register = async (req, res) => {
    const { email, password, fullName } = req.body
    const user = await usersService.register(email, password, fullName)

    return res.status(StatusCodes.CREATED).json(user)
}

module.exports = { login, register }