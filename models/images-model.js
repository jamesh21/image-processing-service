const pool = require('../services/db-service')
const { DB_TO_API_MAPPING } = require('../constants/field-mapping-constant')
const { transformFields } = require('../utils/field-mapper-util')

class ImagesModel {

    addImageToDB = async (userId, imageUrl) => {
        const addedImage = await pool.query('INSERT INTO images (user_id, image_url) VALUES ($1, $2) RETURNING *', [userId, imageUrl])
        if (addedImage.rowCount === 0) {
            console.error('could not create image')
            // throw error here
        }
        return transformFields(addedImage.rows[0], DB_TO_API_MAPPING)
    }
}


module.exports = new ImagesModel()