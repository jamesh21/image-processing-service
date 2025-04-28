const { StatusCodes } = require('http-status-codes')
const AppError = require('./app-error')

class DatabaseError extends AppError {
    constructor(message, statusCode = StatusCodes.INTERNAL_SERVER_ERROR) {
        super(message, statusCode)
    }
}

module.exports = DatabaseError