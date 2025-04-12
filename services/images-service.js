const s3Service = require('./s3-service')
const imageModel = require('../models/images-model')
const sharp = require('sharp');
const { BadRequestError, UnauthenticatedError, ForbiddenError } = require('../errors')

class ImagesService {

    uploadImage = async (file, userId) => {
        if (!file || !userId) {
            throw new BadRequestError('File or userId was not provided')
        }
        // Do i need diff try/catch blocks for upload and metadata retrieval for better error messages?
        try {
            const fileName = `${Date.now()}_${file.originalname}`
            const imageKey = `images/${fileName}`
            console.log(file.mimetype)
            // upload image to s3
            await s3Service.uploadFile({
                buffer: file.buffer,
                key: imageKey,
                mimetype: file.mimetype

            })

            // retrieve metadata for image
            const metadata = await sharp(file.buffer).metadata()

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
        //TODO destructure transformations to individual transformation
        const { resize, rotate } = transformations
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

        // retrieve image from s3 and perform transformation
        const image = await s3Service.getImage(imageDetails.imageS3Key)

        // create transformer object
        const transformer = sharp()
        if (rotate) {
            transformer.rotate(rotate)
        }
        if (resize) {
            transformer.resize(resize.width, resize.height)
        }

        // apply transformations to image and create image buffer
        const transformedImgBuffer = await image.Body.pipe(transformer).toBuffer();

        // store in s3
        const fileName = `${Date.now()}_transformed-${imageId}`
        const imageKey = `images/${fileName}`
        await s3Service.uploadFile({
            buffer: transformedImgBuffer,
            key: imageKey, //TODO need to create unique key with transformations
            mimetype: 'image/jpeg'
        })
        // store in db
        // Using s3 key, add to DB
        // const addedImageData = await imageModel.addImageToDB(userId, imageKey, fileName)
        // const url = this.buildImageUrl(addedImageData.imageId)

        // TODO add to redis cache
        // returns url and metadata of image
    }

    buildImageUrl = (imageId) => {
        return `${process.env.API_URL}/images/${imageId}`
    }
}

module.exports = new ImagesService()