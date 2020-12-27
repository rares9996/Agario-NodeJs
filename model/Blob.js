module.exports = function Blob(x, y, r, randomColor) {
    this.pos = createVector(x, y);
    this.r = r;
    this.vel = createVector(0, 0);
    this.color = randomColor;
    this.name = ""
    this.score = 0;
    this.update = function() {

        let newX = mouseX - width / 2; //noile miscari sunt relative la centrul view-ului
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
        if (d < this.r + other.r) { //veirificam distanta dintre cele doua si suma razelor pt a vedea daca exista coliziune

            let sum = PI * this.r * this.r + PI * other.r * other.r; //suma ariilor
            this.r = sqrt(sum / PI); //deducem raza finala a playerul dupa ce a mancat
            return true;
        } else {
            return false;
        }
    };
    this.show = function() {
        fill(this.color);
        if (this.name != "") { //desenare scor si nume
            textSize(20 * this.r / 100);
            text(this.name, this.pos.x - this.r * 0.5, this.pos.y + this.r);
            document.getElementById("score").innerHTML = this.score;
        }
        ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2); //deseneaza cerc cu centrul in x,y si diametrul dat (inaltime, lungime)
    };


}