const express = require('express')
const { getImages, uploadImage, getImage, transformImage } = require('../controllers/images-controller')
const multer = require('multer')

const router = express.Router()
const upload = multer()

router.route('/')
    .get(getImages)
    .post(upload.single('image'), uploadImage)
router.route('/:id')
    .get(getImage)
router.route('/:id/transform')
    .post(transformImage)

module.exports = router