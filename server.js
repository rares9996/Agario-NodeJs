if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
module.exports = {}
const express = require('express')
const app = express()
const bcrypt = require('bcrypt') //secure password
const passport = require('passport') //to manage logged in state of users
const flash = require('express-flash')
const session = require('express-session') //store and persist user across different pages
const methodOverride = require('method-override')
const mysql = require('mysql');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, './public');
const port = process.env.PORT || 3000;
let server = http.createServer(app);
let io = socketIO(server);

let Player = require("./model/Player");

const initializePassport = require('./passport-config')
const { userInfo } = require('os')
const { use } = require('passport')
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

let db = mysql.createConnection({
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

//Set static folder-> send to client
app.use('/client', express.static('./client/'));

let playerName;
let id = 0;

function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

//home page -> needs authentication to get there

app.get('/', checkAuthenticated, (req, res) => {
    const user = req.user;
    playerName = user.Username;
    user.then(user => {
        res.render('index.ejs', { name: user.Username })
            // let color = color(random(255), random(255), random(255));
            // let color = getRandomColor();
            // player = new Blob(Math.floor(Math.random() * 600), Math.floor(Math.random() * 600), 30, color); //creeaza scena, apeleaza show, update, eats
            // player.name = user.Username; 

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
/*

let players = []; 
function Blob(id, x, y, r) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.r = r;
}
setInterval(refresh, 33);

function refresh() {
  io.sockets.emit('refresh', players);
}
  
let SOCKET_LIST = {}; 
//lista unde vor fi stocati playerii
io.on('connection', socket => {
    //SOCKET_LIST[socket.id] = socket;
    socket.on('start', function(data) {
        console.log(socket.id + ' ' + data.x + ' ' + data.y + ' ' + data.r);
        let player = new Blob(socket.id, data.x, data.y, data.r);
        players.push(player);
    });
    socket.on('update', function(data) {
        console.log(socket.id + " " + data.x + " " + data.y + " " + data.r);
        let player;
        for (let i = 0; i < players.length; i++) {
          if (socket.id == players[i].id) {
            player = player[i];
          }
        }
        player.x = data.x;
        player.y = data.y;
        player.r = data.r;
      });
  
      socket.on('disconnect', function() {
        console.log('Client has disconnected');
      });
    
    

});*/

var players = [];
setInterval(heartbeat, 100);

function heartbeat() {
    io.sockets.emit('heartbeat', players);
}

function Blob(id, x, y, r, color, name, score) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;
    this.name = name;
    this.score = score;
}
var socket_id;
io.sockets.on(
    'connection',
    // We are given a websocket object in our function
    function(socket) {
        console.log('We have a new client: ' + socket.id);

        socket.on('start', function(data) {
            console.log(socket.id + ' ' + data.x + ' ' + data.y + ' ' + data.r + ' ' + data.name + ' ' + data.score);
            var blob = new Blob(socket.id, data.x, data.y, data.r, data.color, data.name, data.score);
            players.push(blob);
        });

        socket.on('update', function(data) {
            for (var i = 0; i < players.length; i++) {
                if (socket.id == players[i].id) {
                    socket_id = i;
                    players[i].x = data.x;
                    players[i].y = data.y;
                    players[i].r = data.r;
                    players[i].color = data.color;
                    players[i].score = data.score;
                    players[i].name = data.name;

                }
            }
        });

        socket.on('disconnect', function() {
            console.log('Client has disconnected');
            players.splice(socket_id, 1);
        });
    }
);
server.listen(3000);