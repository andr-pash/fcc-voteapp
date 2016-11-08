const User = require('./models/user')
const Poll = require('./models/poll')

module.exports = (app, passport) => {

    // allow cross origin requests in dev-mode
    if (process.env.MODE === "dev") {
        app.all('*', function(req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });
    }

    app.get('/',
    // isLoggedIn,
    (req, res) => {
        res.redirect('hot')
    })

    app.get('/hot', (req, res) => {

        Poll.find()
            .limit(30)
            .sort({ totalVotes: -1 })
            .then( (polls) => {

              res.render('pollCollection', {
                  pageTitle: 'Hot Polls',
                  polls: polls,
                  loggedIn: req.isAuthenticated()
              })
            })
            .catch( (err) => {
              console.log(err)
            })
    })

    app.get('/myPolls', isLoggedIn, (req, res) => {

        Poll.find({
            userid: req.user.id
        }, (err, polls) => {
            if (err)
                return console.log(err)

            res.render('pollCollection', {
                polls: polls,
                pageTitle: 'My Polls',
                loggedIn: req.isAuthenticated()
            })
        })
    })

    app.get('/poll/:id', (req, res) => {
        const hashId = req.params.id
        Poll.findOne({
            hashId
        }, (err, poll) => {
            if (err)
                return console.log(err)

            if (!poll)
                return res.redirect('/')

            const renderInfo = {
                pageTitle: poll.title,
                loggedIn: req.isAuthenticated(),
                isOwner: poll.isOwner(req.user),
                options: poll.options,
                totalVotes: poll.totalVotes
            }
            res.render('poll', renderInfo)
        })
    })

    app.get('/api/poll/:id', (req, res) => {
        const hashId = req.params.id
        Poll.findOne({
            hashId
        }, (err, poll) => {
            if (err)
                return console.log(err)

            console.log('response poll api get:', poll.createResponseObject())
            res.json(poll.createResponseObject())
        })
    })

    app.post('/api/addVote', (req, res) => {
        const hashId = req.body.hashId
        const answerId = req.body.answerId

        console.log('add vote endpoint hit')

        Poll.findOne({
            hashId
        }, (err, poll) => {
            if (err)
                return console.log(err)

            poll.addVote(answerId)
            poll.save()
            res.send(poll.createResponseObject())
        })
    })

    app.post('/api/deletePoll', isLoggedIn, (req, res) => {
        console.log('deletePoll hit')
        const hashId = req.body.hashId
        const user = req.user

        Poll.findOne({
            hashId
        }, (err, poll) => {
            if (err)
                return console.log(err)

            console.log('isOwner', poll.isOwner(user))
            if (poll.isOwner(user))
                poll.remove()

            res.redirect('/')
        })

    })

    app.post('/api/addOption', isLoggedIn, (req, res) => {
        const hashId = req.body.hashId
        const optionName = req.body.optionName

        Poll.findOne({
            hashId
        }, (err, poll) => {
            if (err)
                return console.log(err)

            const newOption = poll.createOptionObject(optionName)
            poll.addOption(newOption)
            poll.save()
            res.send(poll.createResponseObject())
        })
    })

    app.get('/createPoll', isLoggedIn, (req, res) => {
        res.render('createPoll', {
            pageTitle: 'Create Poll',
            loggedIn: req.isAuthenticated()
        })
    })

    app.post('/api/createPoll', isLoggedIn, (req, res) => {
        console.log('createPoll post endpoint hit')
        function simpleCB(obj) {
            res.json(obj)
        }
        createNewPoll(req.user.id, req.body, simpleCB)
    })

    app.get('/register', (req, res) => {
        res.render('register', {
            pageTitle: 'Register',
            loggedIn: req.isAuthenticated()
        })
    })

    app.post('/register', (req, res) => {
        console.log(req.body.username)
        User.find({
            $or: [
                {
                    email: req.body.email
                }, {
                    username: req.body.username
                }
            ]
        }, (err, user) => {
            if (err)
                return console.log(err)

            if (user.length === 0) {
                createNewUser(req.body.username, req.body.email, req.body.password)
                res.redirect('/')
            }

            if (user.length > 0) {
                res.send('user already in database')
            }

        })

    })

    app.get('/login', (req, res) => {
        res.render('login', {
            pageTitle: 'Login',
            loggedIn: req.isAuthenticated()
        })
    })

    app.post('/login', passport.authenticate('local', {failureRedirect: '/login'}), (req, res) => {
        console.log('successful login')
        res.redirect('/')
    })

    app.get('/auth/facebook', passport.authenticate('facebook'));

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {failureRedirect: '/login'}), function(req, res) {
        res.redirect('/');
    });

    app.get('/logout', (req, res) => {
        req.logout()
        res.redirect('/login')
    })


    app.get('*', function(req, res){
      res.render('404', { pageTitle: '404', loggedIn: req.isAuthenticated()});
    });

}

function isLoggedIn(req, res, next) {

    console.log('check if logged in');
    console.log(req.isAuthenticated());

    if (req.isAuthenticated())
        return next()

    res.redirect('/login')

}

function createNewUser(username, email, password) {
    const newUser = new User()

    newUser.email = email
    newUser.username = username
    newUser.password = newUser.createHash(password)

    newUser.save((err) => {
        if (err)
            console.error(err)

        console.log('successfully created new user')
    })
}

function createNewPoll(userid, pollData, done) {

    const newPoll = new Poll()
    newPoll.title = pollData.title
    newPoll.userid = userid
    newPoll.hashId = newPoll.createHashId(newPoll._id)

    pollData.options.map(el => {
        if (el !== '') {
            let optionObject = newPoll.createOptionObject(el)
            newPoll.addOption(optionObject)
        }
    })

    newPoll.save((err) => {
        if (err)
            return console.log(err)

        console.log('succesfully saved new Poll')
        done({pollAddress: `/poll/${newPoll.hashId}`})
    })
}
