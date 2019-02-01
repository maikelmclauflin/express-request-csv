const express = require('express')
const bodyParser = require('body-parser')
const expressRequestCSV = require('../')

const app = express()
app.use(bodyParser.json())

module.exports = {
  app,
  addRoute
}

function addRoute (path, options) {
  const middleware = expressRequestCSV(options)
  app.use(path, middleware, handlePassback)
}

function handlePassback (req, res) {
  res.json(req.body)
}
