const s3Service = require('./s3-service')
const imageModel = require('../models/images-model')
const sharp = require('sharp');
const { BadRequestError, UnauthenticatedError, ForbiddenError } = require('../errors')
const path = require('path')

class ImagesService {

    uploadImage = async (file, userId) => {
        if (!file || !userId) {
            throw new BadRequestError('File or userId was not provided')
        }
        // Do i need diff try/catch blocks for upload and metadata retrieval for better error messages?
        try {
            const fileName = `${Date.now()}_${file.originalname}`
            const imageKey = `images/${fileName}`

            // upload image to s3
            await s3Service.uploadFile({
                buffer: file.buffer,
                key: imageKey,
                mimetype: file.mimetype

            })

            // retrieve metadata for image
            const metadata = this.getFilteredMetadata(await sharp(file.buffer).metadata())

            // Using s3 key, add to DB
            const addedImageData = await imageModel.addImageToDB(userId, imageKey, fileName)
            // build api url for retrieving image
            const url = this.buildImageUrl(addedImageData.imageId)

            return { data: { url, metadata } }

        } catch (error) {
            console.error('upload error:', error)
            // throw error here
        }
    }

    getUserImages = async (userId) => {
        if (!userId) {
            throw new UnauthenticatedError('User is not logged in')
        }
        const images = await imageModel.getUserImagesFromDB(userId)
        // build url of images
        for (const image of images) {
            image.url = `${process.env.API_URL}/images/${image.imageId}`
        }
        return {
            data: images, count: images.length
        }
    }

    getImage = async (imageId, userId) => {
        if (!imageId) {
            throw new BadRequestError('Image Id was not provided')
        }
        if (!userId) {
            throw new UnauthenticatedError('User is not logged in')
        }

        const image = await imageModel.getImageFromDB(imageId)

        // check if user is owner of image 
        if (userId !== image.userId) {
            throw new ForbiddenError('User cannot access this image')
        }
        // Retrieves image stream from s3
        const imageStream = await s3Service.getImage(image.imageS3Key)

        return imageStream
    }

    transformImage = async (imageId, userId, transformations) => {

        if (!imageId || !transformations) {
            throw new BadRequestError('Image id or transformation was not provided')
        }
        if (!userId) {
            throw new UnauthenticatedError('User is not logged in')
        }
        // retrieve image details from db
        const imageDetails = await imageModel.getImageFromDB(imageId)

        if (userId !== imageDetails.userId) {
            throw new ForbiddenError('User cannot access this image')
        }

        // extract transformation and create labels
        const { transformLabels, transformer } = this.extractTransformations(transformations)

        const { name: imageName, ext } = path.parse(imageDetails.imageFileName)

        const newImageName = `${imageName}_${transformLabels.join('_')}`

        // retrieve image from s3 and perform transformation
        const image = await s3Service.getImage(imageDetails.imageS3Key)

        //With this name, we can check cache
        // TODO add to redis cache 

        // apply transformations to image and create image buffer
        const transformedImgBuffer = await image.Body.pipe(transformer).toBuffer();
        const metadata = this.getFilteredMetadata(await sharp(transformedImgBuffer).metadata(), { transformations: transformLabels })
        // metadata.transformations = transformLabels
        // store in s3
        const imageKey = `images/${newImageName}${ext}`
        await s3Service.uploadFile({
            buffer: transformedImgBuffer,
            key: imageKey,
            mimetype: image.ContentType
        })

        // store in db
        const addedImageData = await imageModel.addImageToDB(userId, imageKey, `${newImageName}${ext}`)
        const url = this.buildImageUrl(addedImageData.imageId)

        return { url, metadata }
    }

    // Extracts all transformations and adds them individually to sharp's transformer and also build the label for naming the new file.
    extractTransformations = (transformations) => {
        const { resize, rotate, filters, flip } = transformations

        const transformLabels = []
        // create transformer object
        const transformer = sharp()
        if (rotate) {
            transformer.rotate(rotate)
            transformLabels.push(`rotate${rotate}`)
        }
        if (flip) {
            transformer.flip()
            transformLabels.push('flip')
        }
        if (resize && resize.height, resize.width) {
            transformer.resize(resize.width, resize.height)
            transformLabels.push(`resize:w${resize.width},h${resize.height}`)
        }
        if (filters.grayscale) {
            transformer.grayscale()
            transformLabels.push('grayscale')
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
    // const transformationLabel = [
    //     width ? `w${width}` : null,
    //     height ? `h${height}` : null,
    //     grayscale ? 'grayscale' : null,
    //   ].filter(Boolean).join('_'); // 👉 w300_h200_grayscale
}

module.exports = new ImagesService()
