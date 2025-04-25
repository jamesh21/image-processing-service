class UserModel {

    static get apiToDbFieldMap() {
        return {
            userId: 'user_id',
            email: 'email_address',
            name: 'full_name',
            password: 'password_hash'
        }
    }

    static get dbToApiFieldMap() {
        return {
            email_address: 'email',
            full_name: 'name',
            user_id: 'userId',
            password_hash: 'password'
        }
    }

    static get tableName() {
        return 'users'
    }

    static fromDb(row) {
        if (!row) {
            return null
        }
        return {
            userId: row.user_id,
            email: row.email_address,
            name: row.full_name,
            password: row.password_hash
        }
    }

    // Converts user object as api format to db format to prepare to be used with db queries
    static toDb(user) {
        const result = {}
        const fieldMap = this.apiToDbFieldMap
        // loop through user fields and assign them to the corresponding dbField
        for (const [key, value] of Object.entries(user)) {
            const dbField = fieldMap[key]
            if (dbField) { // only include fields that are in fieldmap
                result[dbField] = value
            }
        }
        return result
    }
}

module.exports = UserModel