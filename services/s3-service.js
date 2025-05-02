const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { AppError } = require('../errors')
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

    /**
     * Uploads passed in buffer to s3 bucket
     * @param {*} param0 
     */
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
            throw new AppError(`Failed to upload file with key ${key} to S3`)
        }

    }

    /**
     * Retrieves image from s3 bucket
     * @param {*} s3Key 
     * @returns 
     */
    getImage(s3Key) {
        const input = {
            Bucket: this.bucketName,
            Key: s3Key
        }
        try {
            const command = new GetObjectCommand(input)
            return this.s3.send(command)
        } catch (error) {
            throw new AppError(`Failed to retrieve file from S3 for ${s3Key}`)
        }

    }

    /**
     * Deletes image from s3 bucket
     * @param {*} s3Key 
     * @returns 
     */
    deleteImage(s3Key) {
        const input = {
            Bucket: this.bucketName,
            Key: s3Key
        }
        try {
            const command = new DeleteObjectCommand(input)
            return this.s3.send(command)
        } catch (error) {
            throw new AppError(`Failed to delete file from s3 for ${s3Key}`)
        }

    }

}

module.exports = new S3Service()