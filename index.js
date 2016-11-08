require('dotenv').config()
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => app.listen(3000))


const bodyParser = require('body-parser')
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const passport = require('passport')
require('./app/config/passport')(passport)
const app = express()



// config app
app.use('/public', express.static(__dirname + '/app/public'))
app.set('view engine', 'ejs')
app.set('views', __dirname + '/app/views')
app.use(bodyParser())
app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  resave: false,
  store: new MongoStore({ mongooseConnection: db })
}))
app.use(passport.initialize())
app.use(passport.session())

require(__dirname + '/app/routes')(app, passport)
