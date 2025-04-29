const { StatusCodes } = require('http-status-codes')
class AppError extends Error {
    constructor(message, statusCode = StatusCodes.INTERNAL_SERVER_ERROR, stack = '') {
        super(message)
        this.statusCode = statusCode
        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}


module.exports = AppError