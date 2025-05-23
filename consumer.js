require("dotenv").config();
const amqp = require("amqplib");
const TransformerService = require('./services/transformer-service')
const s3Service = require('./services/s3-service')
const imageRepository = require('./repository/images-repository')
const { FORMAT_MAPPING } = require('./constants/app-constant')
const sharp = require('sharp')
const path = require('path')


/**
 * Consumer function for our job queue, Used to retrieve image from s3 and performs transfomations on it, and then uploading to s3 and writing to db.
 */
async function startConsumer() {
    const conn = await amqp.connect("amqp://localhost");
    const channel = await conn.createChannel();

    const queue = "image.transform";
    await channel.assertQueue(queue, { durable: true });

    channel.consume(queue, async (msg) => {
        if (!msg) return;
        const job = JSON.parse(msg.content.toString());
        const { oldImageFileName, originalImageS3Key, newImageId, transformations } = job

        // extract transformation and create labels
        const transformLabels = TransformerService.createLabels(transformations)
        const transformer = TransformerService.createTransformer(transformations)
        try {

            // retrieve actual image from s3 and perform transformations
            const image = await s3Service.getImage(originalImageS3Key)
            const transformedImgBuffer = await image.Body.pipe(transformer).toBuffer()

            // retrieve original image name and file extension, this will be used when naming the transformed image.
            const { name: imageName } = path.parse(oldImageFileName)

            // New image name with old name and transformations performed
            const newImageName = `${imageName}_${transformLabels.join('_')}`

            const metadata = await sharp(transformedImgBuffer).metadata()
            const imageKey = `images/${newImageName}.${FORMAT_MAPPING[metadata.format].ext}`

            console.log(`Uploading image key ${imageKey} to s3`)

            await s3Service.uploadFile({ buffer: transformedImgBuffer, key: imageKey, mimetype: FORMAT_MAPPING[metadata.format].mime })

            console.log(`Successfully uploaded image key ${imageKey} to s3`)
            console.log(`Updating image details for image id ${newImageId} in DB`)

            await imageRepository.updateImageInDB(newImageId, { 'imageS3Key': imageKey, 'imageFileName': newImageName, 'mimeType': FORMAT_MAPPING[metadata.format].mime, 'status': 'ready' })

            console.log(`Successfully updated image details for image id ${newImageId} in DB`)
            channel.ack(msg); // ✅ Acknowledge successful processing
        } catch (err) {
            console.error("Error processing job:", err);
            // update image in db to failed
            await imageRepository.updateImageInDB(newImageId, { 'status': 'failed' })
            channel.nack(msg, false, false); // ❌ Discard the message (or send to DLQ)
        }
    });

    console.log(`Listening on queue "${queue}"...`);
}


startConsumer();
