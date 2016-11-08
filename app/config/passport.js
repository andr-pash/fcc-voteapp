// const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')

module.exports = (passport) => {

  passport.serializeUser( (user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser( (id, done) => {
    User.findById(id, (err, user) => {
      console.log(err, user)
      done(err, user)
    })
  })

  passport.use('local', new LocalStrategy(
    (username, password, done) => {
      console.log(username, password)
      User.findOne({ username }, (err, user) => {
        if (err)
          return done(err)

        if (!user)
          return done(null, false, { message: 'Incorrect Username.' })

        if (!verifyPassword(user, password)){
          console.log('wrong password')
          return done(null, false, { message: 'Incorrect Password.' })
        }

        console.log('right password')
        return done(null, user)
      })
    }
  ))

  passport.use('facebook', new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRECT,
      callbackURL: 'http://127.0.0.1:3000/auth/facebook/callback'
    },
    function(accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ facebookId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  ))

}


function verifyPassword(user, password) {
  console.log('checking password')
  return user.verifyPassword(password, user.password)
}
