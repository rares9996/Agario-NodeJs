
let canvas = document.querySelector('canvas');
const socket = io();

let ctx = canvas.getContext('2d');

let bounds = 1100;

class Player {
  constructor(x, y, radius, color, name) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.radius = radius;
      this.name = name;
      this.move = '';
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
function draw( player_en) {
  ctx.beginPath();
  ctx.arc(player_en.x, player_en.y, player_en.radius, 0, Math.PI * 2, false);
  ctx.fillStyle = player_en.color;
  ctx.fill();
}

const player = new Player(100, 100, 20, 'blue');
//player.draw();

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

  createFood(1100, 8, 150, food);
  drawFood(food);

  var movement = {
    up: false,
    down: false,
    left: false,
    right: false
  }


  
  document.onkeydown =  function(event) {
    switch (event.keyCode) {
      case 65: // A
        movement.left = true;
        break;
      case 87: // W
        movement.up = true;
        break;
      case 68: // D
        movement.right = true;
        break;
      case 83: // S
        movement.down = true;
        break;
    }
  };

  document.onkeyup = function(event) {
    switch (event.keyCode) {
      case 65: // A
        movement.left = false;
        break;
      case 87: // W
        movement.up = false;
        break;
      case 68: // D
        movement.right = false;
        break;
      case 83: // S
        movement.down = false;
        break;
    }
  };


socket.on('new_player', (new_player) =>{  //la primirea mesajului 'new_player', se deseneaza acesta
  console.log(new_player.name);
  draw(new_player);
});

setInterval(function() {  //se transmite mesaj de 'movement' la  un anumit intrval pt miscarea playerilor
  socket.emit('movement', movement);
 
}, 1000 / 60);

socket.on('redraw_players', function(players)  {
 
  for( var i = 0 ; i < players.length; i++){
    if (players[i].move == 'up'){
      ctx.clearRect(players[i].x-30, players[i].y - 30 + 10, 60, 60);
      console.log('up');
    }else if (players[i].move == 'left'){
      ctx.clearRect(players[i].x-30 + 10, players[i].y - 30, 60, 60);
      console.log('not up');
    }else if (players[i].move == 'right'){
      ctx.clearRect(players[i].x-30 - 10, players[i].y - 30 , 60, 60);
    }else if (players[i].move == 'down'){
      ctx.clearRect(players[i].x-30 , players[i].y - 30 -10 , 60, 60);
    }
   
    //ctx.clearRect(0, 0, 1100, 600);
     draw(players[i]);
  };
})
