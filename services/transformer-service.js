const { SUPPORTED_FORMATS } = require('../constants/app-constant')
const sharp = require('sharp');

class TransformerService {

    // Map of all the transformations that are currently supported. For each key, 
    // there are 3 functions responsible for returning label, validating and applying the transformation
    static transformationsMap = {
        rotate: {
            validate: (angle) => {
                if (typeof angle !== 'number') {
                    return 'rotation must be a number'
                }
            },
            label: (angle) => {
                return `rotate:${angle}`
            },
            apply: (sharpInstance, angle) => {
                return sharpInstance.rotate(angle)
            }
        },
        flip: {
            validate: (willApply) => {
                if (typeof willApply !== 'boolean') {
                    return 'flip must be a boolean'
                }
            },
            label: (willApply) => {
                return willApply ? 'flip' : ''
            },
            apply: (sharpInstance, willApply) => {
                return willApply ? sharpInstance.flip() : sharpInstance
            }
        },
        resize: {
            validate: (measurements) => {
                const { width, height } = measurements
                if (typeof width !== 'number' || typeof height !== 'number') {
                    return 'resize must include width and height as numbers'
                }
            },
            label: (measurements) => {
                return `resize:w${measurements.width},h${measurements.height}`
            },
            apply: (sharpInstance, measurements) => {
                return sharpInstance.resize(measurements)
            }
        },
        crop: {
            validate: (options) => {
                const { width, height, top, left } = options
                if (typeof width !== 'number' || typeof height !== 'number' || typeof left !== 'number' || typeof top !== 'number') {
                    return 'crop must include width, height, top, left as numbers'
                }
            },
            label: (options) => {
                const { width, height, top, left } = options
                return `crop:w${width},h${height},top${top},left${left}`
            },
            apply: (sharpInstance, options) => {
                return sharpInstance.extract(options)
            }
        },
        format: {
            validate: (newFormat) => {
                if (typeof newFormat !== 'string' || !SUPPORTED_FORMATS.includes(newFormat)) {
                    return `Image can only be converted to ${SUPPORTED_FORMATS.join(', ')}`
                }
            },
            label: (newFormat) => {
                return `format:${newFormat}`
            },
            apply: (sharpInstance, newFormat) => {
                return sharpInstance.toFormat(newFormat)
            }
        },
        grayscale: {
            validate: (willApply) => {
                if (typeof willApply !== 'boolean') {
                    return 'grayscale must be a boolean'
                }
            },
            label: (willApply) => {

                return willApply ? 'grayscale' : ''

            },
            apply: (sharpInstance, willApply) => {
                return sharpInstance.grayscale(willApply)
            }
        },
        sepia: {
            validate: (willApply) => {
                if (typeof willApply !== 'boolean') {
                    return 'sepia must be a boolean'
                }
            },
            label: (willApply) => {
                return willApply ? 'sepia' : ''
            },
            apply: (sharpInstance, willApply) => {
                if (willApply) {
                    return sharpInstance.recomb([
                        [0.393, 0.769, 0.189],
                        [0.349, 0.686, 0.168],
                        [0.272, 0.534, 0.131]
                    ])
                }
                return sharpInstance
            }
        }
    }


    /**
     * Creates labels representing which transformations will be performed by using the passed in options parmameter
     * @param {*} options 
     * @returns an array of transformation labels
     */
    static createLabels = (options) => {
        const labels = []
        for (const key in options) {
            const optionVal = options[key]
            const transformationHandler = TransformerService.transformationsMap[key]
            if (transformationHandler?.label) {
                const label = transformationHandler.label(optionVal)
                if (label) {
                    labels.push(label)
                }
            }
        }
        return labels
    }

    /**
     * Validates if the options passed in are in the correct format
     * @param {*} options 
     * @returns an array of error messages that informs which option has formating errors, by default it will have size of 1 for the initial error message. 
     */
    static validate = (options) => {
        const errors = ['Invalid input for the following transformatios']
        for (const key in options) {
            const optionVal = options[key]
            const transformationHandler = TransformerService.transformationsMap[key]
            if (transformationHandler?.validate) {
                const error = transformationHandler.validate(optionVal)
                if (error) {
                    errors.push(error)
                }
            } else {
                errors.push(`Unsupported transformation ${key}`)
            }
        }
        return errors
    }

    /**
     * Creates the transformer object from sharp and appends the transformations passed in.
     * @param {*} options 
     * @returns 
     */
    static createTransformer = (options) => {
        let transformer = sharp()
        for (const key in options) {
            const optionVal = options[key]
            const transformationHandler = TransformerService.transformationsMap[key]
            if (transformationHandler?.apply) {
                transformer = transformationHandler.apply(transformer, optionVal)
            }
        }
        return transformer
    }
}

module.exports = TransformerService