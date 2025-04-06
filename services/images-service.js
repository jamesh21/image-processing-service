const s3Service = require('./s3-service')
const imageModel = require('../models/images-model')

class ImagesService {

    uploadImage = async (file) => {
        try {
            // upload image to s3
            const url = await s3Service.uploadFile({
                buffer: file.buffer,
                key: `images/${Date.now()}_${file.originalname}`,
                mimetype: file.mimetype

            })

            // Using url, add to DB
            return imageModel.addImageToDB('2', url)
        } catch (error) {
            console.error('upload error:', error)
            // throw error here
        }
    }
}

module.exports = new ImagesService()