// Mapping for db values to values used in backend code
const DB_TO_API_MAPPING = {
    image_id: "imageId",
    image_url: "imageUrl",
    email_address: "email",
    full_name: "name",
    user_id: "userId",
    password_hash: "password"
}

// Mapping for backend code to db values.
const API_TO_DB_MAPPING = {
    imageUrl: 'image_url',
    imageId: 'image_id',
    userId: 'user_id',
    email: 'email_address',
    name: 'full_name',
    password: 'password_hash'
}

module.exports = { DB_TO_API_MAPPING, API_TO_DB_MAPPING }