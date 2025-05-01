const { StatusCodes } = require('http-status-codes')
const AppError = require('./app-error')

class ConflictError extends AppError {
    constructor(message) {
        super(message, StatusCodes.CONFLICT)
    }
}

module.exports = ConflictError