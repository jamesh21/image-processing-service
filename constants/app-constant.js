
const SUPPORTED_FORMATS = [
    'jpeg', 'jpg', 'png', 'webp', 'avif'
]

const FORMAT_MAPPING = {
    jpeg: { ext: 'jpg', mime: 'image/jpeg' },
    jpg: { ext: 'jpg', mime: 'image/jpeg' },
    png: { ext: 'png', mime: 'image/png' },
    webp: { ext: 'webp', mime: 'image/webp' },
    avif: { ext: 'avif', mime: 'image/avif' },
    heif: { ext: 'heif', mime: 'image/heif' },
}

const IMAGE_STATUS = {
    ready: 'ready',
    processing: 'processing',
    failed: 'failed'
}
module.exports = { SUPPORTED_FORMATS, FORMAT_MAPPING, IMAGE_STATUS }