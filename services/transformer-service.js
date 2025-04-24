const { SUPPORTED_FORMATS } = require('../constants/app-constant')
const sharp = require('sharp');
class TransformerService {
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