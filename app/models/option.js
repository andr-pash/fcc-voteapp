const mongoose = require('mongoose')

const optionSchema = mongoose.Schema({
  name: { type: String },
  count: { type: Number, default: 0 }
})


module.exports = mongoose.model('Option', optionSchema)
