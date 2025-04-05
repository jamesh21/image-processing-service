const s3Service = require('./s3-service')

class ImagesService {

    uploadImage = async (file) => {
        try {
            // upload image to s3
            const url = await s3Service.uploadFile({
                buffer: file.buffer,
                key: `images/${Date.now()}_${file.originalname}`,
                mimetype: file.mimetype

            })
            return url
        } catch (error) {
            console.error('upload error:', error)
            // throw error here
        }

        // Using url, add to DB


    }
}

module.exports = new ImagesService()