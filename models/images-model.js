const pool = require('../services/db-service')
const { DB_TO_API_MAPPING } = require('../constants/field-mapping-constant')
const { transformFields } = require('../utils/field-mapper-util')

class ImagesModel {

    addImageToDB = async (userId, imageUrl) => {
        const addedImage = await pool.query('INSERT INTO images (user_id, image_s3_key) VALUES ($1, $2) RETURNING *', [userId, imageUrl])
        if (addedImage.rowCount === 0) {
            console.error('could not create image')
            // throw error here
        }
        return transformFields(addedImage.rows[0], DB_TO_API_MAPPING)
    }
    getUserImagesFromDB = async (userId) => {
        const images = await pool.query('SELECT image_id, image_s3_key, created_at FROM images WHERE user_id=($1)', [userId])
        const formattedImages = []
        // loop through images
        for (const image of images.rows) {
            formattedImages.push(transformFields(image, DB_TO_API_MAPPING))
        }
        return formattedImages
    }
    getImageFromDB = async (imageId) => {
        const image = await pool.query('SELECT * FROM images WHERE image_id=($1)', [imageId])
        if (image.rowCount === 0) {
            throw new NotFoundError('Image was not found')
        }
        return transformFields(image.rows[0], DB_TO_API_MAPPING)
    }
}


module.exports = new ImagesModel()