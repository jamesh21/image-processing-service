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
    // Need to check if user has access to this image
    const imageStream = await imagesService.getImage(id, userId)

    res.setHeader('Content-Type', 'image/jpeg');
    // stream image as response
    imageStream.Body.pipe(res)

}


// Retrieve all images for this user
const getImages = async (req, res) => {
    const { userId } = req.user
    const userImages = await imagesService.getUserImages(userId)
    return res.status(StatusCodes.OK).json(userImages)
}

// Retrieve image and perform transformations
const transformImage = async (req, res) => {
    const { id } = req.params
    const { userId } = req.user
    const { transformations } = req.body
    const imageStream = await imagesService.transformImage(id, userId, transformations)
    // console.log(imageStream)
    // res.setHeader('Content-Type', 'image/jpeg');
    // imageStream.pipe(res)
    return res.send('transformImage route')
}

module.exports = { getImages, uploadImage, getImage, transformImage }