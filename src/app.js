const path = require('path')
const express = require('express')
const rotjs = require('rot-js')

const app = express()

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')

// setup static directory to server with express
app.use(express.static(publicDirectoryPath))

app.get('*', (req, res) => {
    res.sendFile(publicDirectoryPath +'/index.html')
})

app.listen(port, () => {
    console.log('server is up on port ' + port)
})