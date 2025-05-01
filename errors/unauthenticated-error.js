const { StatusCodes } = require('http-status-codes')
const AppError = require('./app-error')

class UnauthenticatedError extends AppError {
    constructor(message) {
        super(message, StatusCodes.UNAUTHORIZED)
    }
}

module.exports = UnauthenticatedError