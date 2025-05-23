const pool = require('../services/db-service')
const ImageModel = require('../models/images-model')
const { DuplicateRecordError } = require('../errors')
const DatabaseErrorHandler = require('../utils/database-error-handler')
const { DB_DUP_ENTRY } = require('../constants/errors-constant')

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
        try {
            // Retrieve db format of image fields, and dynamically creates db columns and placeholders for db insertion query
            const image = ImageModel.toDb(data)
            const columns = Object.keys(image).join(', ')
            const values = Object.values(image)
            const placeholders = values.map((_, index) => `$${index + 1}`).join(', ')

            const sqlStatement = `INSERT INTO ${ImageModel.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`
            const addedImage = await pool.query(sqlStatement, values)

            // transform fields from DB format to API format
            return ImageModel.fromDb(addedImage.rows[0])
        } catch (error) {
            if (error.code === DB_DUP_ENTRY) {
                throw new DuplicateRecordError('image ID already exists')
            }
            throw DatabaseErrorHandler.handle(error)
        }
    }

    /**
     * Updates image details in DB
     * @param {*} imageId 
     * @param {*} data 
     * @returns 
     */
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
            return ImageModel.fromDb(updatedImage.rows[0])
        } catch (error) {
            throw DatabaseErrorHandler.handle(error)
        }
    }

    /**
     * Retrieves images for user in DB
     * @param {*} userId 
     * @returns list of images belonging to user
     */
    getUserImagesFromDB = async (userId) => {
        try {
            const images = await pool.query(`SELECT image_id, image_file_name, created_at FROM ${ImageModel.tableName} WHERE user_id=($1) ORDER BY created_at DESC `, [userId])
            const formattedImages = []
            // loop through images
            for (const image of images.rows) {
                // transform fields from DB format to API format and pushes to array
                formattedImages.push(ImageModel.fromDb(image))
            }
            return formattedImages
        } catch (error) {
            throw DatabaseErrorHandler.handle(error)
        }
    }

    /**
     * Retrieves image based on imageId passed in.
     * @param {*} imageId 
     * @returns Image entry for this imageId.
     */
    getImageFromDB = async (imageId) => {
        try {
            const image = await pool.query(`SELECT * FROM ${ImageModel.tableName} WHERE image_id=($1)`, [imageId])

            // transform fields from DB format to API format
            return ImageModel.fromDb(image.rows[0])
        } catch (error) {
            throw DatabaseErrorHandler.handle(error)
        }

    }

    /**
     * Retrieves paginated list of images for user
     * @param {*} userId 
     * @param {*} offset - how many entries to skip
     * @param {*} limit - how many entries will be returned
     * @returns List of images basdd on offset and limit
     */
    getUserPaginatedImagesFromDB = async (userId, offset, limit) => {
        try {
            const images = await pool.query(`SELECT image_id, image_file_name, status, created_at FROM ${ImageModel.tableName} WHERE user_id=($1) ORDER BY created_at DESC LIMIT ($2) OFFSET ($3)`, [userId, limit, offset])
            const formattedImages = []
            // loop through images
            for (const image of images.rows) {
                // transform fields from DB format to API format and pushes to array
                formattedImages.push(ImageModel.fromDb(image))
            }
            return formattedImages
        } catch (error) {
            throw DatabaseErrorHandler.handle(error)
        }
    }
}

module.exports = new ImageRepository()