class Player {
  constructor(player) {
    this.x = player.x;
    this.y = player.y;
    this.r = player.r;
    this.id = player.id;
    this.rgb = player.rgb;
    //this.vel = createVector(0, 0);
    this.pos = createVector(this.x, this.y);
  }

  move () {

   /* let newX = mouseX - width / 2;   //noile miscari sunt relative la centrul view-ului
    let newY = mouseY - height / 2;*/
    let newvel = createVector(mouseX, mouseY  );
    //newvel.sub(this.pos);
    newvel.sub(this.pos);
    newvel.setMag(3);
    //this.vel.lerp(newvel, 0.2);
    this.pos.add(newvel);
    //print(this.pos.x + "    " + newX);
    //print(this.pos.y + "    " + newY);
   /* if ((this.pos.x > w && newX > 0) || (-this.pos.x > w && newX < 0))
        newX = 0;
    if ((this.pos.y > h && newY > 0) || (-this.pos.y > h && newY < 0))
        newY = 0;
    let newvel = createVector(newX, newY); //viteza*/
   // vel.setMag(3); //lungimea vectorului cu care se controleaza viteza
 //   this.vel.lerp(newvel, 0.2);
    //this.pos.add(vel);
}

  draw() {
   // noStroke();
    fill(this.rgb.r, this.rgb.g, this.rgb.b);
    ellipse(this.pos.x, this.pos.y, this.r * 2 , this.r * 2);
  }

 

}