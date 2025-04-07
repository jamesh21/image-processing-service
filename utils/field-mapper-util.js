// Helper function for mapping fields given fieldMappings.
const transformFields = (data, fieldMappings) => {
    const transformedData = {}
    for (const [field, value] of Object.entries(data)) {
        if (field in fieldMappings) {
            transformedData[fieldMappings[field]] = value
        } else {
            transformedData[field] = value
        }
    }
    return transformedData
}


module.exports = { transformFields }