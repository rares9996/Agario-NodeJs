

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

function mousePressed() {
    loop();
 }

function draw() {
    if ( keyIsPressed == true){
        noLoop();
    } 
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
   // console.log("Scor" + blob.score);
    document.getElementById("score").innerHTML = blob.score;
    
    var data = {
        x: blob.pos.x,
        y: blob.pos.y,
        r: blob.r,
        color: blob.color,
        name: blob.name,
        score: blob.score
    };
    socket.emit('update', data);

    var eaten =false;

  
    for (var i = players.length - 1; i >= 0; i--) {
        player = new Blob(players[i].x, players[i].y, players[i].r, players[i].color);
        player.name = players[i].name;
        player.score = players[i].score;
        player.show();

        player.x = 0;
        player.y = 0;
        player.show();
          if((players.length > 1) && (blob.name != player.name) ) {
        
        
        if(blob.eatsPlayer(player)) {
                    
                    blob.r = blob.r + 3;
                    blob.score = blob.score + player.score;
                    player.x = 0;
                    player.y = 0;
                    player.r = 20;
                    player.score = 0;
                    var data_player = {
                        x: player.x,
                        y: player.y,
                        r: player.r,
                        color: player.color,
                        name: player.name,
                        score: player.score
                    };
                    
                    socket.emit('somebdy_eat', data_player);
                    

                    var data = {
                        x: blob.pos.x,
                        y: blob.pos.y,
                        r: blob.r,
                        color: blob.color,
                        name: blob.name,
                        score: blob.score
                    };
                    socket.emit('update', data);
                 
               
                    eaten = false;
               // }
           }

            if(blob.eatenBy(player)) {    //cand este mancat, schimba propriul view si anunta serverul de noua pozitie a
                                         //celui cu care a fost interactiunea
                blob.score = 0;
                blob.r = 20;
                blob.pos.x = 0;
                blob.pos.y = 0;

                player.r = player.r + 3;
                player.score = player.score + blob.score;
                var data_player = {
                    x: player.x,
                    y: player.y,
                    r: player.r,
                    color: player.color,
                    name: player.name,
                    score: player.score
                };
                
                socket.emit('somebdy_eat', data_player);
               
                var data = {
                    x: blob.pos.x,
                    y: blob.pos.y,
                    r: blob.r,
                    color: blob.color,
                    name: blob.name,
                    score: blob.score
                };
                socket.emit('update', data);
                console.log('eaten');
                eaten = true;
                eats = false;
            }
        }
        
    }
    var modal = document.getElementById("GameOver");
    var span = document.getElementsByClassName("close")[0];
    if (eaten == true){
        noLoop();
       
        modal.style.display = "block";
        
    }

    span.onclick = function() {
      modal.style.display = "none";
     }
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
  
    for(var i = players.length - 1; i >= 0; i--){
        player = new Blob(players[i].x, players[i].y, players[i].r, players[i].color);
        player.name = players[i].name;
        player.score = players[i].score;
        pos = getBoardPosition(players, player);
        document.getElementById("p"+ (pos)).innerHTML = player.name + player.score ;
    }
    blob.update();
}

function getBoardPosition(players, element){
    var clonePlayers = players.slice();
    clonePlayers.sort(function(a,b) { return b.score - a.score});

    return clonePlayers.findIndex(x => x.name == element.name) + 1;

}
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");
const messageContainer = document.getElementById("message-container");
const msgerChat = document.getElementById("main");

socket.on('chat-message', data=>{
    //appendMessage(`${data.name}: ${data.message}`);
    appendMessage(data.name, 'https://www.flaticon.com/svg/static/icons/svg/1256/1256650.svg', 'left', data.message) ;
});

messageForm.addEventListener('submit', e=> {
    e.preventDefault();   //not posting on page => not refreshing
    const  message = messageInput.value;
   // appendMessage(`You: ${message}`);
    appendMessage('You','https://image.flaticon.com/icons/svg/145/145867.svg', 'right', message );
    socket.emit('send-chat-message', message);
    messageInput.value = '';
})

/*function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageContainer.append(messageElement);
}*/

function appendMessage(name, img, side, text) {
    const msgHTML = `
      <div class="msg ${side}-msg">
        <div class="msg-img" style="background-image: url(${img})"></div>
  
        <div class="msg-bubble">
          <div class="msg-info">
            <div class="msg-info-name">${name}</div>
  
          <div class="msg-text">${text}</div>
        </div>
      </div>
    `;
   
    msgerChat.insertAdjacentHTML("beforeend", msgHTML);
    msgerChat.scrollTop += 500;
  }


