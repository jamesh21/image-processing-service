const pool = require('../services/db-service')

class ImagesModel {

    addImageToDB = async (userId, imageUrl) => {
        const addedImage = await pool.query('INSERT INTO images (user_id, image_id) VALUES $(1), $(2) RETURNING *', [userId, imageUrl])
        if (addedImage.rowCount === 0) {
            console.error('could not create image')
            // throw error here
        }
        return addedImage.rows[0]
    }
}


module.exports = ImagesModel