const mongoose = require('mongoose')
const HashId = require('hashids')

const pollSchema = mongoose.Schema({
    title: { type: String },
    userid: { type: String },
    hashId: { type: String },
    date: { type: Date, default: Date.now },
    options: [{ name: String, count: Number }],
    totalVotes: { type: Number, default: 0 }
})

pollSchema.methods.addOption = function (addedOption) {
  if (addedOption.name !== '')
    this.options.push(addedOption)
}

pollSchema.methods.createOptionObject = function (optionName) {
  return {
    name: optionName,
    count: 0
  }
}

pollSchema.methods.createHashId = function (id) {
  hashId = new HashId('pollId')
  return hashId.encodeHex(id)
}

pollSchema.methods.addVote = function (index) {
  this.options[index].count += 1
  this.totalVotes += 1
}

pollSchema.methods.createResponseObject = function () {
  const labels = this.options.map( el => el.name )
  const counts = this.options.map( el => el.count )
  const hashId = this.hashId

  return {
    labels,
    counts,
    hashId
  }
}

pollSchema.methods.isOwner = function (user) {
  if (!user)
    return false

  if (this.userid === user.id)
    return true

  return false
}

module.exports = mongoose.model('Poll', pollSchema)
