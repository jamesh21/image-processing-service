require("dotenv").config();
// library that wraps all async function in try catch block
require("express-async-errors");

const express = require('express')
const app = express()

app.use(express.json())



const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`app is listening on port ${port}`)
})