const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const cors = require('cors')
const passport = require('passport')

const UserModel = require('../models/User')
const ChatroomModel = require('../models/Chatroom')

// Register
router.post('/register', (req, res) => {
  const { username, password } = req.body
  UserModel.findOne({ username: username }).then(user => {
    if (user) {
      res.json({ msg: 'User already exists' })
    } else {
      const newUser = new UserModel({
        username,
        password
      })

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err
          newUser.password = hash
          newUser
            .save()
            .then(user => {
              res.json(user)
            })
            .catch(err => console.error(err))
        })
      })
    }
  })
})

// Sign in
router.post('/signin', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      res.json({ msg: 'The username and password does not match an account.' })
    }
    if (!err && user) {
      res.json(user)
      req.login(user, next)
    }
  })(req, res, next)
})

// Sign out
router.get('/signout', (req, res) => {
  req.logout()
  res.end()
})

router.post('/reset', async (req, res) => {
  var user = await UserModel.findOne({ username: req.body.username })
  bcrypt.genSalt(10, (error, salt) => {
    bcrypt.hash(req.body.password, salt, (error, hash) => {
      if (error) throw error
      user.password = hash
      user
        .save()
        .then(user => {
          res.json(user)
        })
        .catch(err => console.error(err))
    })
  })
})

router.post('/update', async (req, res) => {
  var user = await UserModel.findOne({ username: req.body.old })
  user.username = req.body.username
  user.bio = req.body.bio
  user.color = req.body.color
  user.save()
  res.json(user)
})

// Chatroom functions
router.get('/:uid/chatroom/:id/:func', (req, res) => {
  switch (req.params.func) {
    case 'add':
      ChatroomModel.findOne({ id: req.params.id }, async (error, data) => {
        if (!error) {
          var User = await UserModel.findOne({ username: req.params.uid })
          User.chatrooms.push({
            name: data.name,
            id: data.id,
            icon: data.icon
          })
          await User.save()
          res.sendStatus(201)
        }
      })
      break
  }
})

router.get('/:uid/moonrocks/:diff', (req, res) => {
  UserModel.findOneAndUpdate({ username: req.params.uid }, { $inc: { moonrocks: parseInt(req.params.diff) } }, (error, data) => {
    console.log(data)
    res.json(data)
  })
})

module.exports = router