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

const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, './public');
const port = process.env.PORT || 3000;
let server = http.createServer(app);
let io = socketIO(server);

const Player = require('./model/Player');
var players = {}; //lista unde vor fi stocati playerii

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

//Set static folder-> send to client
app.use('/client', express.static('./client/'));

let playerName;
let id = 0;
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

//home page -> needs authentication to get there
let player ;
app.get('/', checkAuthenticated, (req, res) => {
    const user = req.user;  
    user.then(user => {
        res.render('index.ejs', { name: user.Username })
        let color = getRandomColor();  
        player = new Player(Math.floor(Math.random() * 600),Math.floor(Math.random() * 600),30,color,user.Username, id);
        id++;
        
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

let SOCKET_LIST = {}; 

io.on('connection', socket => {
    SOCKET_LIST[socket.id] = socket;
    players[socket.id] = player;
    io.emit('new_player', players[socket.id]); //la conecterea unui player, se anuta clientul pt desenare 
    socket.on('movement', function(key) {
        //let move_player = players[socket.id] || {};
        if (key.left) {
          //move_player.x -= 3;
          players[socket.id].x -= 10;
          players[socket.id].move = 'left';
        }
        if (key.up) {
          //move_player.y -= 3;
          players[socket.id].y -= 10;
          players[socket.id].move = 'up';
        }
        if (key.right) {
          //move_player.x += 3;
          players[socket.id].x += 10;
          players[socket.id].move = 'right';
        }
        if (key.down) {
          //move_player.y += 3;
          players[socket.id].y += 10;
          players[socket.id].move = 'down';
        }
      });

    socket.on('disconnect', () => {
        delete players[socket.id];
        delete SOCKET_LIST[socket.id];
    })
     
});
setInterval(function() {  
    let pack = [];
    for (var i in players){
        pack.push(players[i]);
    }
    for (var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('redraw_players', pack);
    }
  }, 1000/200);

//app running on port 3000
//app.listen(3000)
server.listen(3000);
