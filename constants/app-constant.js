// Mapping for db values to values used in backend code
const DB_TO_API_MAPPING = {
    image_id: 'imageId',
    image_s3_key: 'imageS3Key',
    image_file_name: 'imageFileName',
    email_address: 'email',
    full_name: 'name',
    user_id: 'userId',
    password_hash: 'password',
    mime_type: 'mimeType'
}

// Mapping for backend code to db values.
const API_TO_DB_MAPPING = {
    imageS3Key: 'image_s3_key',
    imageId: 'image_id',
    imageFileName: 'image_file_name',
    userId: 'user_id',
    email: 'email_address',
    name: 'full_name',
    password: 'password_hash',
    mimeType: 'mime_type'
}

const SUPPORTED_FORMATS = [
    'jpeg', 'png', 'webp',
]

module.exports = { DB_TO_API_MAPPING, API_TO_DB_MAPPING, SUPPORTED_FORMATS }