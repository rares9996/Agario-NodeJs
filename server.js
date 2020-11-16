if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
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

app.get('/', checkAuthenticated, (req, res) => {
    const user = req.user
    user.then(user => {
        res.render('index.ejs', { name: user.Username })
    })

})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

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
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        db.query("INSERT INTO users(`Username`,`Email`, `Password`) VALUES(?, ?, ?)", [req.body.name, req.body.email, hashedPassword])
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}
asd
app.listen(3000)