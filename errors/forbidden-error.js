const { StatusCodes } = require('http-status-codes')
const AppError = require('./app-error')

class ForbiddenError extends AppError {
    constructor(message) {
        super(message, StatusCodes.FORBIDDEN)

    }
}

module.exports = ForbiddenError