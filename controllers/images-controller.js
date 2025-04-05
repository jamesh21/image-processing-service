const { StatusCodes } = require('http-status-codes')
const imagesService = require('../services/images-service')


// Retrieve all images for this user
const getImages = (req, res) => {
    return res.send('getImages route')
}

// Upload image passed in from request
const uploadImage = async (req, res) => {
    const file = req.file
    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' })
    }
    const url = await imagesService.uploadImage(file)

    return res.status(StatusCodes.OK).json(url)
}

// Retrieve image based on ID
const getImage = (req, res) => {
    const { id } = req.params
    return res.send('getImage route')
}

// Retrieve image and perform transformation
const transformImage = (req, res) => {
    const { id } = req.params
    return res.send('transformImage route')
}

module.exports = { getImages, uploadImage, getImage, transformImage }