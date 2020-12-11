class Player {
    constructor(x, y, radius, color, name, id) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = radius;
        this.name = name;
        this.id = id;
    }

    //todo: draw name
    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color
        ctx.fill();
    }
}
module.exports = Player;