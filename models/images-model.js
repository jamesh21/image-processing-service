const pool = require('../services/db-service')
const { DB_TO_API_MAPPING } = require('../constants/field-mapping-constant')
const { transformFields } = require('../utils/field-mapper-util')

class ImagesModel {

    addImageToDB = async (userId, imageUrl, fileName) => {
        const addedImage = await pool.query('INSERT INTO images (user_id, image_s3_key, image_file_name) VALUES ($1, $2, $3) RETURNING *', [userId, imageUrl, fileName])
        if (addedImage.rowCount === 0) {
            console.error('could not create image')
            // throw error here
        }
        return transformFields(addedImage.rows[0], DB_TO_API_MAPPING)
    }
    getUserImagesFromDB = async (userId) => {
        const images = await pool.query('SELECT image_id, image_file_name, created_at FROM images WHERE user_id=($1) ORDER BY created_at DESC ', [userId])
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
    getUserPaginatedImagesFromDB = async (userId, offset, limit) => {
        const images = await pool.query('SELECT image_id, image_file_name, created_at FROM images  WHERE user_id=($1) ORDER BY created_at DESC LIMIT ($2) OFFSET ($3)', [userId, limit, offset])
        const formattedImages = []
        // loop through images
        for (const image of images.rows) {
            formattedImages.push(transformFields(image, DB_TO_API_MAPPING))
        }
        return formattedImages
    }
}


module.exports = new ImagesModel()