const s3Service = require('./s3-service')
const imageRepository = require('../repository/images-repository')
const sharp = require('sharp');
const { BadRequestError, UnauthenticatedError, ForbiddenError } = require('../errors')
const path = require('path')
const { SUPPORTED_FORMATS, FORMAT_MAPPING } = require('../constants/app-constant')
const { queueTransformationUp } = require('../producer')
const TransformerService = require('./transformer-service')

class ImagesService {

    uploadImage = async (file, userId) => {
        if (!file || !userId) {
            throw new BadRequestError('File or userId was not provided')
        }
        const originalname = file.originalname
        let buffer = file.buffer
        const fileName = `${Date.now()}_${originalname}`
        // Retrieve file ext of file uploaded
        const expectedType = path.parse(fileName).ext.replace('.', '').toLowerCase()
        if (!SUPPORTED_FORMATS.includes(expectedType)) {
            throw new BadRequestError('Image format is not supported')
        }

        try {
            // retrieve metadata for image
            let metadata = this.getFilteredMetadata(await this.getMetaData(buffer))

            // check if file passed in is actually the correct file format as extension
            // if not, convert it to that format
            if (FORMAT_MAPPING[metadata.format].ext !== expectedType) {
                buffer = await sharp(buffer).toFormat(expectedType).toBuffer()
                // retrieve updated metadata after converting
                metadata = this.getFilteredMetadata(await this.getMetaData(buffer))
            }

            const imageS3Key = `images/${fileName}`

            // upload image to s3
            await s3Service.uploadFile({
                buffer,
                key: imageS3Key,
                mimetype: FORMAT_MAPPING[expectedType].mime
            })

            // Using s3 key, add to DB
            // const addedImageData = await this.addImageToDB(userId, imageKey, fileName, FORMAT_MAPPING[expectedType].mime)
            const addedImageData = await imageRepository.addImageToDB(
                {
                    userId,
                    imageS3Key,
                    'imageFileName': fileName,
                    'mimeType': FORMAT_MAPPING[expectedType].mime,
                    'status': 'ready'
                }
            )

            // build api url for retrieving image
            const url = this.buildImageUrl(addedImageData.imageId)

            return { data: { url, metadata } }

        } catch (error) {
            throw error
        }
    }

    getUserImages = async (userId, page, limit) => {
        if (!userId) {
            throw new UnauthenticatedError('User is not logged in')
        }
        let images;

        if (!limit) {
            images = await imageRepository.getUserImagesFromDB(userId)
        } else {
            if (!parseInt(limit) || !parseInt(page)) {
                throw new BadRequestError('Limit and page must be passed in as a number')
            }
            const offset = (page - 1) * limit
            images = await imageRepository.getUserPaginatedImagesFromDB(userId, offset, limit)
        }

        // build url of images
        for (const image of images) {
            image.url = this.buildImageUrl(image.imageId)
        }
        return {
            data: images, count: images.length
        }
    }

    getImage = async (imageId, userId, format) => {

        if (!userId) {
            throw new UnauthenticatedError('User is not logged in')
        }
        if (!imageId) {
            throw new BadRequestError('Image Id was not provided')
        }
        if (format && !SUPPORTED_FORMATS.includes(format)) {
            throw new BadRequestError('Image format is not supported')
        }

        try {
            const image = await this.getImageFromDB(imageId)
            // check if user is owner of image 
            if (userId !== image.userId) {
                throw new ForbiddenError('User cannot access this image')
            }
            // Retrieves image stream from s3
            const { Body } = await s3Service.getImage(image.imageS3Key)

            if (format) {
                const { transformer } = this.buildTransformer({ format })
                // Returns image stream with transformed format
                return { stream: Body.pipe(transformer), mimeType: `image/${format}` }
            }
            return { stream: Body, mimeType: image.mimeType }
        } catch (err) {
            throw err
        }
    }

    /**
     * Transforms the image corresponding to the image id passed in. The transformed image will be added to the DB and reuploaded to s3
     * @param {*} imageId the image id of the image that will be transformed.
     * @param {*} userId 
     * @param {*} transformations an object of different transformations that will be performed on the image
     * @returns 
     */
    transformImage = async (imageId, userId, transformations) => {
        if (!imageId || !transformations) {
            throw new BadRequestError('Image id or transformation was not provided')
        }
        if (!userId) {
            throw new UnauthenticatedError('User is not logged in')
        }
        try {
            // retrieve image details from db
            const imageDetailsFromDB = await this.getImageFromDB(imageId)

            if (userId !== imageDetailsFromDB.userId) {
                throw new ForbiddenError('User cannot access this image')
            }

            // Check if transformations have any errors
            const errors = TransformerService.validate(transformations)
            if (errors.length > 1) {
                throw new BadRequestError(errors.join(', '))
            }

            // create row in db for rabbitmq to populate later
            // const addedImageData = await this.addImageToDB(userId)
            const addedImageData = await imageRepository.addImageToDB({ userId }) // this will fail, when 

            // Send transformation information to rabbitmq
            queueTransformationUp(imageDetailsFromDB.imageFileName, imageDetailsFromDB.imageS3Key, addedImageData.imageId, transformations)


            // TODO add to redis cache, With this name, we can check cache

            // create dummy url first for user to access when image transformation is finished processing
            const url = this.buildImageUrl(addedImageData.imageId)

            // return { url, metadata }
            return { url }

        } catch (error) {
            throw error
        }

    }

    buildImageUrl = (imageId) => {
        return `${process.env.API_URL}/images/${imageId}`
    }

    getFilteredMetadata = (fullMetaData, customFields) => {
        return {
            size: fullMetaData.size,
            format: fullMetaData.format,
            width: fullMetaData.width,
            height: fullMetaData.height,
            ...customFields
        }
    }

    getMetaData = async (buffer) => {
        try {
            return await sharp(buffer).metadata()
        } catch (error) {
            throw new Error(`Failed to retrieve metadata for image with key ${imageKey}: ${error.message}`)
        }
    }

    addImageToDB = async (userId, imageKey, fileName, mimeType) => {
        try {
            return await imageRepository.addImageToDB(userId, imageKey, fileName, mimeType)
        } catch (error) {
            try {
                // Rollback entry in s3
                await s3Service.deleteImage(imageKey)
                console.error(`Removing ${imageKey} from s3 since there was a db insertion failure`)
            } catch (s3Error) {
                console.error('Failed to rollback s3 upload', {
                    imageKey,
                    originalError: error.message,
                    rollbackError: s3Error.message
                })
            }
            throw error
        }
    }
    getImageFromDB = async (imageId) => {
        try {
            return await imageRepository.getImageFromDB(imageId)
        } catch (error) {
            throw new Error(`Failed to retrieve image from DB for image id ${imageId}`)
        }
    }
}

module.exports = new ImagesService()
