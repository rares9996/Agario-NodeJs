let blob;
let blobs = [];
let zoom = 1;
let w = 1000;
let h = 1000;
let nrBlobs = 200;
let randomColor;
let initialRadius = 25;
const socket = io();
let players = [];
let player;
let idList;
let numberPlayers = 0;


/*

function Blob(x, y, r, randomColor) {
    this.pos = createVector(x, y);
    this.r = r;
    this.vel = createVector(0, 0);
    this.color = randomColor;
    this.name = ""
    this.score = 0;
    this.update = function() {

        let newX = mouseX - width / 2;   //noile miscari sunt relative la centrul view-ului
        let newY = mouseY - height / 2;
        print(this.pos.x + "    " + newX);
        print(this.pos.y + "    " + newY);
        if ((this.pos.x > w && newX > 0) || (-this.pos.x > w && newX < 0))
            newX = 0;
        if ((this.pos.y > h && newY > 0) || (-this.pos.y > h && newY < 0))
            newY = 0;
        let newvel = createVector(newX, newY); //viteza
        newvel.setMag(3); //lungimea vectorului cu care se controleaza viteza
        this.vel.lerp(newvel, 0.2);
        this.pos.add(this.vel);
    };

    this.eats = function(other) {
        let d = p5.Vector.dist(this.pos, other.pos); //calc distanta dintre player si food
        if (d < this.r + other.r) {  //veirificam distanta dintre cele doua si suma razelor pt a vedea daca exista coliziune

            let sum = PI * this.r * this.r + PI * other.r * other.r; //suma ariilor
            this.r = sqrt(sum / PI); //deducem raza finala a playerul dupa ce a mancat
            return true;
        } else {
            return false;
        }
    };
    this.show = function() {
        fill(this.color);
        if (this.name != "") {   //desenare scor si nume
            textSize(20 * this.r / 100);
            text(this.name, this.pos.x - this.r * 0.5, this.pos.y + this.r);
            document.getElementById("score").innerHTML = this.score;
        }
        ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2); //deseneaza cerc cu centrul in x,y si diametrul dat (inaltime, lungime)
    };
}
*/

function setup() {
    createCanvas(1200, 800);
    for (let i = 0; i < nrBlobs; i++) {
        let x = random(-w, w);
        let y = random(-h, h);
        randomColor = color(random(255), random(255), random(255));
        blobs[i] = new Blob(x, y, 10, randomColor);
    }
    var letters = '0123456789ABCDEF';
    var colors = '#';
    for (var i = 0; i < 6; i++) {
        colors += letters[Math.floor(Math.random() * 16)];
    }
    blob = new Blob(0, 0, 64, colors);
    blob.name = document.getElementById("name").innerHTML;
    var data = {
        x: blob.pos.x,
        y: blob.pos.y,
        r: blob.r,
        color: blob.color,
        name: blob.name,
        score: blob.score
    };
    socket.emit('start', data);
    socket.on('heartbeat', function(data) {
        players = data;
    });
}


function draw() {
    background(200);
    translate(width / 2, height / 2);
    var newzoom = 64 / blob.r;
    zoom = lerp(zoom, newzoom, 0.1);
    scale(zoom);
    translate(-blob.pos.x, -blob.pos.y);
    stroke(255);
    fill(255, 255, 255, 100);
    rect(-w - blob.r, -h - blob.r, w * 2 + blob.r * 2, h * 2 + blob.r * 2, 10);


    for (var i = blobs.length - 1; i >= 0; i--) {
        blobs[i].show();
        if (blob.eats(blobs[i])) {
            var x = random(-w, w);
            var y = random(-h, h);
            var randomColor;
            randomColor = color(random(255), random(255), random(255));
            blobs[i] = new Blob(x, y, 16, randomColor);
            blob.score++;
        }
    }

    var data = {
        x: blob.pos.x,
        y: blob.pos.y,
        r: blob.r,
        color: blob.color,
        name: blob.name,
        score: blob.score
    };
    socket.emit('update', data);
    for (var i = players.length - 1; i >= 0; i--) {
        player = new Blob(players[i].x, players[i].y, players[i].r, players[i].color);
        player.name = players[i].name;
        player.score = players[i].score;
        player.show();
    }
    blob.update();
}