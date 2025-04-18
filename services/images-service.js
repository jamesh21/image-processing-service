const s3Service = require('./s3-service')
const imageModel = require('../models/images-model')
const sharp = require('sharp');
const { BadRequestError, UnauthenticatedError, ForbiddenError } = require('../errors')
const path = require('path')
const { SUPPORTED_FORMATS } = require('../constants/app-constant')

class ImagesService {

    uploadImage = async (file, userId) => {
        if (!file || !userId) {
            throw new BadRequestError('File or userId was not provided')
        }
        const fileName = `${Date.now()}_${file.originalname}`
        const imageKey = `images/${fileName}`

        try {
            // upload image to s3
            await this.uploadImageToS3(file.buffer, imageKey, file.mimetype)

            // retrieve metadata for image
            const metadata = this.getFilteredMetadata(await this.getMetaData(file.buffer))

            // Using s3 key, add to DB
            const addedImageData = await this.addImageToDB(userId, imageKey, fileName, file.mimetype)

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
            images = await imageModel.getUserImagesFromDB(userId)
        } else {
            if (!parseInt(limit) || !parseInt(page)) {
                throw new BadRequestError('Limit and page must be passed in as a number')
            }
            const offset = (page - 1) * limit
            images = await imageModel.getUserPaginatedImagesFromDB(userId, offset, limit)
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
            const { Body } = await this.getImageFromS3(image.imageS3Key)

            if (format) {
                const transformer = sharp().toFormat(format)
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

            // extract transformation and create labels
            const { transformLabels, transformer } = this.buildTransformer(transformations)

            // retrieve original image name and file extension, this will be used when naming the transformed image.
            const { name: imageName, ext } = path.parse(imageDetailsFromDB.imageFileName)

            // New image name with old name and transformations performed
            const newImageName = `${imageName}_${transformLabels.join('_')}`

            // retrieve actual image from s3 and perform transformations
            const image = await this.getImageFromS3(imageDetailsFromDB.imageS3Key)

            //With this name, we can check cache
            // TODO add to redis cache 

            // apply transformations to image and create image buffer
            const transformedImgBuffer = await image.Body.pipe(transformer).toBuffer();
            const metadata = this.getFilteredMetadata(await sharp(transformedImgBuffer).metadata(), { transformations: transformLabels })

            // store in s3
            const imageKey = `images/${newImageName}${ext}`
            await this.uploadImageToS3(transformedImgBuffer, imageKey, image.ContentType)

            // store in db
            const addedImageData = await this.addImageToDB(userId, imageKey, `${newImageName}${ext}`, image.ContentType)
            const url = this.buildImageUrl(addedImageData.imageId)

            return { url, metadata }

        } catch (error) {
            throw error
        }

    }

    // Extracts all transformations and adds them individually to sharp's transformer and also build the label for naming the new file.
    buildTransformer = (options) => {

        const transformLabels = [], transformer = sharp(), errors = ['Invalid input for the following transformatios']

        // Lookup table, for different transformations
        const transformationMap = {
            rotate: (angle) => {
                if (typeof angle !== 'number') {
                    errors.push('rotation must be a number')
                } else {
                    transformer.rotate(angle)
                    transformLabels.push(`rotate${angle}`)
                }
            },
            flip: (val) => {
                if (typeof val !== 'boolean') {
                    errors.push('flip must be a boolean')
                } else if (val) {
                    transformer.flip()
                    transformLabels.push('flip')
                }
            },
            resize: (options) => {
                const { width, height } = options
                if (typeof width !== 'number' || typeof height !== 'number') {
                    errors.push('resize must include width and height as numbers')
                } else {
                    transformer.resize(options)
                    transformLabels.push(`resize:w${options.width},h${options.height}`)
                }
            },
            crop: (options) => {
                const { width, height, top, left } = options
                if (typeof width !== 'number' || typeof height !== 'number' || typeof left !== 'number' || typeof top !== 'number') {
                    errors.push('crop must include width, height, top, left as numbers')
                } else {
                    transformer.extract(options)
                    transformLabels.push(`crop:w${options.width},h${options.height},top${options.top},left${options.left}`)
                }
            },
            grayscale: (val) => {
                if (typeof val !== 'boolean') {
                    errors.push('grayscale must be a boolean')
                } else if (val) {
                    transformer.grayscale()
                    transformLabels.push('grayscale')
                }
            },
            sepia: (val) => {
                if (typeof val !== 'boolean') {
                    errors.push('sepia must be a boolean')
                } else if (val) {
                    transformer.recomb([
                        [0.393, 0.769, 0.189],
                        [0.349, 0.686, 0.168],
                        [0.272, 0.534, 0.131]
                    ])
                    transformLabels.push('sepia')
                }
            }
        }

        // Loop through each transsformation and create the label and add to transformer object
        for (const [key, value] of Object.entries(options)) {
            const transformFn = transformationMap[key]
            if (transformFn) {
                transformFn(value)
            }
        }

        // Check if errors came up
        if (errors.length > 1) {
            throw new BadRequestError(errors.join(', '))
        }
        return { transformer, transformLabels }
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

    uploadImageToS3 = async (buffer, imageKey, mimeType) => {
        try {
            return await s3Service.uploadFile({
                buffer: buffer,
                key: imageKey,
                mimetype: mimeType
            })
        } catch (error) {
            throw new Error(`Failed to upload image with key ${imageKey} to S3: ${error.message}`)
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
            return await imageModel.addImageToDB(userId, imageKey, fileName, mimeType)
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
            return await imageModel.getImageFromDB(imageId)
        } catch (error) {
            throw new Error(`Failed to retrieve image from DB for image id ${imageId}`)
        }
    }
    getImageFromS3 = async (imageKey) => {
        try {
            return await s3Service.getImage(imageKey)
        } catch (error) {
            throw new Error(`Failed to retrieve image from s3 for ${imageKey}`)
        }
    }
}

module.exports = new ImagesService()
