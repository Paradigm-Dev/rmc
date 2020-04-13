const mongoose = require('mongoose')

const NewsSchema = new mongoose.Schema({
  author: String,
  cover: String,
  content: String,
  timestamp: String,
  title: String,
  uploaded: Boolean
})

const NewsModel = mongoose.model('new', NewsSchema)

module.exports = NewsModel