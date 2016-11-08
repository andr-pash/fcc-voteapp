const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = mongoose.Schema({
    username: {type: String, unique: true},
    email: {type: String, unique: true},
    password: String,
    type: String
})

userSchema.methods.createHash = (password) => {
  return bcrypt.hashSync(password, 9)
}

userSchema.methods.verifyPassword = (password, hash) => {
  return bcrypt.compareSync(password, hash)
}

module.exports = mongoose.model('User', userSchema)
