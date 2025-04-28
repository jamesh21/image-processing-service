const { DatabaseError } = require('../errors')
const { StatusCodes } = require('http-status-codes')
const { DB_CONN_REFUSED, DB_TIME_OUT, DB_INVALID_COL, DB_CONN_FAIL_MSG, DB_QUERY_TO, GENERIC_ERR_MSG } = require('../constants/errors-constant')


class DatabaseErrorHandler {
    static handle(error) {
        if (error.code && error.code === DB_INVALID_COL) {
            return new DatabaseError('Invalid Column entered', StatusCodes.BAD_REQUEST)
        } else if (error.code && error.code === DB_CONN_REFUSED) { // db connect failed
            return new DatabaseError(DB_CONN_FAIL_MSG, StatusCodes.SERVICE_UNAVAILABLE)
        } else if (error.code && error.code === DB_TIME_OUT) { // db timed out
            return new DatabaseError(DB_QUERY_TO, StatusCodes.GATEWAY_TIMEOUT)
        } else {
            return new DatabaseError(GENERIC_ERR_MSG, StatusCodes.INTERNAL_SERVER_ERROR)
        }
    }
}

module.exports = DatabaseErrorHandler