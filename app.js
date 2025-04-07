require("dotenv").config();
// library that wraps all async function in try catch block
require("express-async-errors");

const express = require('express')
const app = express()
// routers
const imageRouter = require('./routes/images-route')
const userRouter = require('./routes/users-route')
// middleware
const authMiddleware = require('./middleware/auth-middleware')
const errorHandlerMiddleware = require('./middleware/error-handler-middleware')
const notFoundMiddleware = require('./middleware/not-found-middleware')

app.use(express.json())

app.use('/api/v1/images', authMiddleware, imageRouter)
app.use('/api/v1/auth', userRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`app is listening on port ${port}`)
})