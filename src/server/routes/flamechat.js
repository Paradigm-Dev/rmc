const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()

const ChatroomModel = require('../models/Chatroom.js')
const UserModel = require('../models/User.js')

// New chatroom
router.post('/chatroom/new', (req, res) => {
  ChatroomModel.create({
    icon: req.body.icon,
    id: req.body.id,
    name: req.body.name,
    owner: req.body.owner,
    theme: req.body.theme,
    messages: []
  }).then(data => {
    ChatroomModel.findOne({ id: data.id }, async (error, data) => {
      if (!error) {
        var User = await UserModel.findOne({ username: req.body.owner })
        User.chatrooms.push(data.id)
        await User.save()
        res.json(data)
      }
    })
  })
})

// Chatroom data
router.get('/chatroom/:id', (req, res) => {
  ChatroomModel.findOne({ id: req.params.id }, (error, data) => {
    if (!error) {
      res.json(data)
    } else {
      res.statusCode(500)
      console.log(error)
    }
  })
})

// Checks if data has changed
router.get('/chatroom/:id/inspect/:v', (req, res) => {
  ChatroomModel.findOne({ id: req.params.id }, async (error, data) => {
    if (data.__v != req.params.v) res.json({ result: true })
    else res.json({ result: false })
  })
})

// Send message
router.post('/chatroom/:id/send', async (req, res) => {
  var Chatroom = await ChatroomModel.findOne({ id: req.params.id })
  var message = {
    color: req.body.color,
    username: req.body.username,
    content: req.body.content,
    pic: req.body.pic,
    timestamp: Date.now(),
    id: mongoose.ObjectId
  }
  Chatroom.messages.push(message)
  await Chatroom.save()
  res.json(message)
})

// Deletes message
router.get('/chatroom/:id/message/:mid/delete', async (req, res) => {
  var Chatroom = await ChatroomModel.findOne({ id: req.params.id })
  Chatroom.messages.pull(req.params.mid)
  await Chatroom.save()
  res.json(Chatroom.data)
})

module.exports = router