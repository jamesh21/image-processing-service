const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

class S3Service {
    constructor() {
        this.bucketName = process.env.S3_BUCKET_NAME
        this.s3 = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
        });
    }

    async uploadFile({ buffer, key, mimetype }) {
        const uploadParams = {
            Bucket: this.bucketName,
            Key: key,
            Body: buffer,
            ContentType: mimetype
        };
        try {
            const command = new PutObjectCommand(uploadParams)
            await this.s3.send(command)
        } catch (error) {
            console.error(error.message)
            throw new Error(`Failed to upload file with key ${imageKey} to S3`)
        }

    }

    getImage(s3Key) {
        const input = {
            Bucket: this.bucketName,
            Key: s3Key
        }
        try {
            const command = new GetObjectCommand(input)
            return this.s3.send(command)
        } catch (error) {
            console.error(error.message)
            throw new Error(`Failed to retrieve file from S3 for ${s3Key}`)
        }

    }

    deleteImage(s3Key) {
        const input = {
            Bucket: this.bucketName,
            Key: s3Key
        }
        const command = new DeleteObjectCommand(input)
        return this.s3.send(command)
    }

}

module.exports = new S3Service()