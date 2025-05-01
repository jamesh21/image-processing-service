// test-producer.js
const amqp = require("amqplib");

async function queueTransformationUp(oldImageFileName, originalImageS3Key, newImageId, transformations) {
    const conn = await amqp.connect("amqp://localhost");
    const channel = await conn.createChannel();

    const queue = "image.transform";
    await channel.assertQueue(queue, { durable: true });

    const job = {
        oldImageFileName,
        originalImageS3Key,
        newImageId,
        transformations
    };

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(job)));

    await channel.close();
    await conn.close();
}

module.exports = { queueTransformationUp }



