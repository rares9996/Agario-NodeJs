let canvas = document.querySelector('canvas');
console.log(canvas);

let ctx = canvas.getContext('2d');

let bounds = 600;

class Player {
    constructor(x, y, radius, color, name) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = radius;
        this.name = name;
    }

    //todo: draw name
    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color
        ctx.fill();
    }
}

class Blob {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = radius;
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color
        ctx.fill();
    }
}

const blob = new Blob(100, 100, 30, 'blue');
blob.draw();

let food = new Array();

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  
const createFood = (bounds, radius, numBlobs, food) => {
    for (let i = 0; i < numBlobs; i++) {
      let xPos = Math.floor(Math.random() * bounds)
      let yPos = Math.floor(Math.random() * bounds)
      
      color = getRandomColor();
      
      let blob = new Blob(xPos, yPos, radius, color);
      food.push(blob);
    }
  }

  const drawFood = (circlesArr) => {
    for (const circle of circlesArr) {
      circle.draw();
    }
  }

  createFood(600, 8, 50, food);
  drawFood(food);