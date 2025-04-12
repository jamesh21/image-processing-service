const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
// const { Upload } = require('@aws-sdk/lib-storage');
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
        // const upload = new Upload({
        //     client: this.s3,
        //     params: {

        //     }
        // })
        const command = new PutObjectCommand(uploadParams)
        await this.s3.send(command)

        return this.getPublicUrl(key)
    }

    getImage(s3Key) {
        const input = {
            Bucket: this.bucketName,
            Key: s3Key
        }
        const command = new GetObjectCommand(input)
        return this.s3.send(command)
    }

    getPublicUrl(key) {
        return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }

}

module.exports = new S3Service()