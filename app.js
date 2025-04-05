require("dotenv").config();
// library that wraps all async function in try catch block
require("express-async-errors");

const express = require('express')
const app = express()
const imageRouter = require('./routes/images-route')

app.use(express.json())
app.use('/api/v1/images', imageRouter)


const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`app is listening on port ${port}`)
})