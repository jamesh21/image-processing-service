class ImagesModel {

    static get apiToDbFieldMap() {
        return {
            imageS3Key: 'image_s3_key',
            imageId: 'image_id',
            imageFileName: 'image_file_name',
            mimeType: 'mime_type',
            userId: 'user_id',
            status: 'status'
        }
    }

    static get dbToApiFieldMap() {
        return {
            image_id: 'imageId',
            image_s3_key: 'imageS3Key',
            image_file_name: 'imageFileName',
            mime_type: 'mimeType',
            user_id: 'userId',
            status: 'status'
        }
    }

    static get tableName() {
        return 'images'
    }

    static fromDb(row) {
        if (!row) {
            return null
        }
        return {
            imageId: row.image_id,
            imageS3Key: row.image_s3_key,
            imageFileName: row.image_file_name,
            mimeType: row.mime_type,
            status: row.status,
            userId: row.user_id,
            createdAt: row.created_at
        }
    }

    // Converts user object as api format to db format to prepare to be used with db queries
    static toDb(image) {
        const result = {}
        const fieldMap = this.apiToDbFieldMap
        // loop through user fields and assign them to the corresponding dbField
        for (const [key, value] of Object.entries(image)) {
            const dbField = fieldMap[key]
            if (dbField) { // only include fields that are in fieldmap
                result[dbField] = value
            }
        }
        return result
    }
}

module.exports = ImagesModel