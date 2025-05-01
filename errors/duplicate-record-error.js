const { StatusCodes } = require('http-status-codes')
const DatabaseError = require('./database-error')

class DuplicateRecordError extends DatabaseError {
    constructor(message) {
        super(message, StatusCodes.CONFLICT)
    }
}

module.exports = DuplicateRecordError