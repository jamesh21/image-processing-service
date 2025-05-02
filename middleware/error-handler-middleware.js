const { StatusCodes } = require('http-status-codes')
const { GENERIC_ERR_MSG } = require('../constants/errors-constant')
const { AppError } = require('../errors')

const errorHandler = (err, req, res, next) => {
    let customError = {
        message: err.message || GENERIC_ERR_MSG,
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    };

    if (!(err instanceof AppError) || customError.statusCode >= StatusCodes.INTERNAL_SERVER_ERROR) {
        console.error(err)
    }
    if (customError.statusCode == StatusCodes.INTERNAL_SERVER_ERROR) { // sets generic message if 500 status code
        customError.message = GENERIC_ERR_MSG
    }
    res.status(customError.statusCode).json({ error: customError.message });
}

module.exports = errorHandler