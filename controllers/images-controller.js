const { StatusCodes } = require('http-status-codes')
const imagesService = require('../services/images-service')
const { BadRequestError } = require('../errors')


// Upload image passed in from request
const uploadImage = async (req, res) => {
    const { userId } = req.user
    const file = req.file
    if (!file) {
        throw new BadRequestError('No file uploaded')
    }
    // result contains url and metadata of image
    const result = await imagesService.uploadImage(file, userId)

    return res.status(StatusCodes.CREATED).json(result)
}



// Retrieve image based on ID and streams it to client
const getImage = async (req, res) => {
    const { id } = req.params
    const { userId } = req.user
    const { format } = req.query

    const { stream, mimeType } = await imagesService.getImage(id, userId, format)

    res.setHeader('Content-Type', mimeType);
    stream.pipe(res)
}


// Retrieve all images for this user
const getImages = async (req, res) => {
    const { userId } = req.user
    const { page, limit } = req.query

    const userImages = await imagesService.getUserImages(userId, page, limit)
    return res.status(StatusCodes.OK).json(userImages)
}

// Retrieve image and perform transformations
const transformImage = async (req, res) => {
    const { id } = req.params
    const { userId } = req.user
    const { transformations } = req.body
    const result = await imagesService.transformImage(id, userId, transformations)


    return res.status(StatusCodes.OK).json(result)
}

module.exports = { getImages, uploadImage, getImage, transformImage }