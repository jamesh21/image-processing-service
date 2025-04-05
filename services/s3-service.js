const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

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
            ContentType: mimetype,
            ACL: "public-read"
        };
        const command = new PutObjectCommand(uploadParams)
        await this.s3.send(command)

        return this.getPublicUrl(key)
    }

    getPublicUrl(key) {
        return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }

}

module.exports = new S3Service()