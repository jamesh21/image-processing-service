const pool = require('../services/db-service')
const ImageModel = require('../models/images-model')
const { NotFoundError } = require('../errors')

class ImageRepository {
    /**
      * Creates an image entry in DB
      * @param {*} userId
      * @param {*} imageUrl 
      * @param {*} fileName 
      * @param {*} mimetype 
      * @returns The created image row
      */
    addImageToDB = async (data) => {
        const image = ImageModel.toDb(data)
        const columns = Object.keys(image).join(', ')
        const values = Object.values(image)
        const placeholders = values.map((_, index) => `$${index + 1}`).join(', ')

        // Try catch for db queries?
        const sqlStatement = `INSERT INTO ${ImageModel.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`
        const addedImage = await pool.query(sqlStatement, values)

        if (addedImage.rowCount === 0) {
            throw Error('Could not create image entry in DB')
        }
        // transform fields from DB format to API format
        return ImageModel.fromDb(addedImage.rows[0])
    }

    updateImageInDB = async (imageId, data) => {
        const setStatements = [], values = []
        const image = ImageModel.toDb(data)
        let i = 1
        for (const [field, value] of Object.entries(image)) {
            setStatements.push(`${field}=$${i}`)
            values.push(value)
            i++
        }

        values.push(imageId)
        const sqlStatement = `UPDATE ${ImageModel.tableName} SET ${setStatements.join(', ')} WHERE image_id = $${i} RETURNING *`
        try {
            const updatedImage = await pool.query(sqlStatement, values)
            if (updatedImage.rowCount === 0) {
                throw new Error(`Image could not be updated for image id ${imageId}`)
            }
            return ImageModel.fromDb(updatedImage.rows[0])

        } catch (error) {
            throw error
        }

    }
    /**
     * Retrieves images for user in DB
     * @param {*} userId 
     * @returns list of images belonging to user
     */
    getUserImagesFromDB = async (userId) => {
        const images = await pool.query(`SELECT image_id, image_file_name, created_at FROM ${ImageModel.tableName} WHERE user_id=($1) ORDER BY created_at DESC `, [userId])
        const formattedImages = []
        // loop through images
        for (const image of images.rows) {
            // transform fields from DB format to API format and pushes to array
            formattedImages.push(ImageModel.fromDb(image))
        }
        return formattedImages
    }

    /**
     * Retrieves image based on imageId passed in.
     * @param {*} imageId 
     * @returns Image entry for this imageId.
     */
    getImageFromDB = async (imageId) => {
        const image = await pool.query(`SELECT * FROM ${ImageModel.tableName} WHERE image_id=($1)`, [imageId])
        if (image.rowCount === 0) {
            throw new NotFoundError(`Image was not found for image id ${imageId}`)
        }
        // transform fields from DB format to API format
        return ImageModel.fromDb(image.rows[0])
    }

    /**
     * Retrieves paginated list of images for user
     * @param {*} userId 
     * @param {*} offset - how many entries to skip
     * @param {*} limit - how many entries will be returned
     * @returns List of images basdd on offset and limit
     */
    getUserPaginatedImagesFromDB = async (userId, offset, limit) => {
        const images = await pool.query(`SELECT image_id, image_file_name, created_at FROM ${ImageModel.tableName} WHERE user_id=($1) ORDER BY created_at DESC LIMIT ($2) OFFSET ($3)`, [userId, limit, offset])
        const formattedImages = []
        // loop through images
        for (const image of images.rows) {
            // transform fields from DB format to API format and pushes to array
            formattedImages.push(ImageModel.fromDb(image))
        }
        return formattedImages
    }
}

module.exports = new ImageRepository()