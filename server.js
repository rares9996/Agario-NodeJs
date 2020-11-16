if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt') //secure password
const passport = require('passport') //to manage logged in state of users
const flash = require('express-flash')
const session = require('express-session') //store and persist user across different pages
const methodOverride = require('method-override')
const mysql = require('mysql');

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => {
        return new Promise((resolve, reject) => {

            try {
                db.query(
                    ' SELECT * FROM `users` WHERE `email` = ?  ', email,
                    function(err, rows) {
                        if (err) {
                            reject(err)
                        }
                        resolve(rows[0]);
                    }
                );
            } catch (err) {
                reject(err)
            }
        })
    },
    id => {
        return new Promise((resolve, reject) => {

            try {
                db.query(
                    ' SELECT * FROM `users` WHERE `id` = ?  ', id,
                    function(err, rows) {
                        if (err) {
                            reject(err)
                        }
                        resolve(rows[0]);
                    }
                );
            } catch (err) {
                reject(err)
            }
        })
    }
)
const config = {
    "host": "localhost",
    "user": "root",
    "password": "root",
    "base": "mysql_example"
};

var db = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.base
});

db.connect(function(error) {
    if (!!error)
        throw error;

    console.log('mysql connected to ' + config.host + ", user " + config.user + ", database " + config.base);
});

//using ejs
app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

//home page -> needs authentication to get there
app.get('/', checkAuthenticated, (req, res) => {
    const user = req.user
    user.then(user => {
        res.render('index.ejs', { name: user.Username })
    })
})


app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

//using passport to know the logged in state of users
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async(req, res) => {
    try {
        //password, email = the name field in register.ejs
        //async function pause until Promise is settled
        const hashedPassword = await bcrypt.hash(req.body.password, 10) //secured with bcrypt
        
        db.query("INSERT INTO users(`Username`,`Email`, `Password`) VALUES(?, ?, ?)", [req.body.name, req.body.email, hashedPassword])
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

//instead of post
app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

// users not authenticated not allowed to go to home page
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

//users authenticated not going to login page again 
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

//app running on port 3000
app.listen(3000)