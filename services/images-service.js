const s3Service = require('./s3-service')
const imageModel = require('../models/images-model')
const sharp = require('sharp');
const { BadRequestError } = require('../errors')

class ImagesService {

    uploadImage = async (file, userId) => {
        if (!file || !userId) {
            throw new BadRequestError('File or userId was not provided')
        }
        // Do i need diff try/catch blocks for upload and metadata retrieval for better error messages?
        try {
            // upload image to s3
            const url = await s3Service.uploadFile({
                buffer: file.buffer,
                key: `images/${Date.now()}_${file.originalname}`,
                mimetype: file.mimetype

            })

            // retrieve metadata for image
            const metadata = await sharp(file.buffer).metadata()

            // Using url, add to DB
            const addedImageData = await imageModel.addImageToDB(userId, url)

            return { url: addedImageData.imageUrl, metadata }
        } catch (error) {
            console.error('upload error:', error)
            // throw error here
        }
    }
}

module.exports = new ImagesService()