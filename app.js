require("dotenv").config();
// library that wraps all async function in try catch block
require("express-async-errors");

const express = require('express')
const app = express()
const imageRouter = require('./routes/images-route')
const userRouter = require('./routes/users-route')
const authMiddleware = require('./middleware/auth-middleware')
app.use(express.json())
app.use('/api/v1/images', authMiddleware, imageRouter)
app.use('/api/v1/auth', userRouter)


const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`app is listening on port ${port}`)
})