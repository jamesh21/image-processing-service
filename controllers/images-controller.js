const { StatusCodes } = require('http-status-codes')
const imagesService = require('../services/images-service')




// Upload image passed in from request
const uploadImage = async (req, res) => {
    const { userId } = req.user
    const file = req.file
    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' })
    }
    // result contains url and metadata of image
    const result = await imagesService.uploadImage(file, userId)

    return res.status(StatusCodes.OK).json(result)
}

// Retrieve all images for this user
const getImages = (req, res) => {
    return res.send('getImages route')
}


// Retrieve image based on ID
const getImage = (req, res) => {
    const { id } = req.params
    return res.send('getImage route')
}

// Retrieve image and perform transformations
const transformImage = (req, res) => {
    const { id } = req.params
    return res.send('transformImage route')
}

module.exports = { getImages, uploadImage, getImage, transformImage }