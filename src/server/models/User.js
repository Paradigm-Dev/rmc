const mongoose = require('mongoose')

const StoredChatroomSchema = new mongoose.Schema({
  name: String,
  id: String,
  icon: String
})

const FriendSchema = new mongoose.Schema({
  username: String,
  pic: String,
  color: String
})

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  color: String,
  pic: String,
  chatrooms: [StoredChatroomSchema],
  friends: [FriendSchema],
  rights: {
    admin: Boolean,
    author: Boolean,
    asteroid: Boolean
  },
  moonrocks: Number
})

const UserModel = mongoose.model('user', UserSchema)

module.exports = UserModel