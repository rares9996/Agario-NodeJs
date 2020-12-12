var blob;
var blobs = [];
var zoom = 1;
var w = 1000;
var h = 1000;
var nrBlobs = 200;
var randomColor;


function Blob(x, y, r, randomColor) {
    this.pos = createVector(x, y);
    this.r = r;
    this.vel = createVector(0, 0);
    this.red = red;
    this.color = randomColor;
    this.name = ""
    this.score = 0;
    this.update = function() {

        var newX = mouseX - width / 2;
        var newY = mouseY - height / 2;
        print(this.pos.x + "    " + newX);
        print(this.pos.y + "    " + newY);
        if ((this.pos.x > w && newX > 0) || (-this.pos.x > w && newX < 0))
            newX = 0;
        if ((this.pos.y > h && newY > 0) || (-this.pos.y > h && newY < 0))
            newY = 0;
        var newvel = createVector(newX, newY);
        newvel.setMag(3);
        this.vel.lerp(newvel, 0.2);
        this.pos.add(this.vel);
    };

    this.eats = function(other) {
        var d = p5.Vector.dist(this.pos, other.pos);
        if (d < this.r + other.r) {
            var sum = PI * this.r * this.r + PI * other.r * other.r;
            this.r = sqrt(sum / PI);
            return true;
        } else {
            return false;
        }
    };
    this.show = function() {
        fill(this.color);
        if (this.name != "") {
            textSize(20 * this.r / 100);
            text(this.name, this.pos.x - this.r * 0.5, this.pos.y + this.r);
            document.getElementById("score").innerHTML = this.score;
        }
        ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
    };
}

function setup() {
    createCanvas(1200, 800);

    randomColor = color(random(255), random(255), random(255));
    blob = new Blob(0, 0, 64, randomColor);
    blob.name = document.getElementById("name").innerHTML;
    for (var i = 0; i < nrBlobs; i++) {
        var x = random(-w, w);
        var y = random(-h, h);
        randomColor = color(random(255), random(255), random(255));
        blobs[i] = new Blob(x, y, 16, randomColor);
    }
}

function draw() {
    background(200);
    translate(width / 2, height / 2);
    var newzoom = 64 / blob.r;
    zoom = lerp(zoom, newzoom, 0.1);
    scale(zoom);
    translate(-blob.pos.x, -blob.pos.y);



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

    blob.show();
    blob.update();
}