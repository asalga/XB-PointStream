// import processing.opengl.*;
/* @pjs preload="images/floor.jpg,images/acorn.jpg,images/wall.jpg,images/lion.jpg,images/mickey.jpg"; */

var userMoving = false;

var rot = 0;
var ps, acorn;
var zoomed = 0;

var fading = false;
var fadeValue = 0;

var fadingPointCloud = false;
var viewingPointCloud = false;

final int GAME_WIDTH = 800;
final int GAME_HEIGHT = 500;

float lastTime = 0.0f;

User user;
Keyboard keyboard;
OBJModel model;
var pointCloudCanvas;
var museumCanvas;

ArrayList walls;
ArrayList easels;

///////////////////////////

public void drawFloor(){
	scale(100, 1, 100);
  texture(floorImg);
  beginShape(QUADS);
  vertex(-1, -1, -1, 0, 0);
  vertex( 1, -1, -1, 1, 0);
  vertex( 1, -1,  1, 1, 1);
  vertex(-1, -1,  1, 0, 1);
  endShape();
}

/*
  Podium for a museum
*/
public class Easel{
  private Vector position;
  private Vector direction;
  private PImage img;
  private float angle;
  private String cloud;
  private boolean isDrawingCloud;
  private Plane preview;
  var func;

  public Easel(){
    isDrawingCloud = false;
    preview = new Plane();
  }
  
  void setCloud(String s){
    cloud = s;
  }
  
  boolean drawingCloud(){
    return isDrawingCloud;
  }

  void setImage(PImage img){
    this.img = img;
    preview.setImage(img);
  }

  void setPosition(PVector pos){
    position = pos;
  }
  
  PVector getPosition(){
    return new PVector(position.x, position.y, position.z);
  }
  
  void setDirection(float a){
    angle = a;
  }
  
  void setPointCloudRendering(f){
    func = f;
  }
  
  void draw(){

    pushMatrix();
    rotateX(PI);
    translate(position.x, -5,-position.z);
    rotateY(-angle);
    scale(0.4, 0.15, 0.5);
    model.drawMode(POLYGON);
    popMatrix();

    pushMatrix();
      translate(position.x + 5, position.y-1, position.z);
      scale(3, 4, 3);
      rotateY(angle);
      rotateX(PI/2.0 - 0.3);
      stroke(0);
      preview.draw();
    popMatrix();
  }
  
  void endDrawing(){
   if(ps && isDrawingCloud){
      //fadeValue = 1.0;
      ps.onRender = function(){};
      ps.stop(cloud);
      ps = null;
    }
  }
  
  void startDrawing(){
    isDrawingCloud = true;
    func(cloud);
  }  
}

// acorn
function a(c){
  if(!ps){
    var cl;
    var buttonDown = false;
    var zoomed = -20;
    var rot = [0, 0];
    var curCoords = [0, 0];

    ps = new PointStream();
    ps.setup(document.getElementById('xbps'));
    ps.pointSize(5);
    ps.background([0, 0, 0, 0.5]);

    ps.onMouseScroll = function(amt){
      zoomed += amt * 1.0;
    };
    
    ps.onMousePressed = function mousePressed(){
      curCoords[0] = ps.mouseX;
      curCoords[1] = ps.mouseY;
      buttonDown = true;
    };
    
    ps.onMouseReleased = function(){ buttonDown = false;};

    ps.onRender = function(){
      var deltaX = ps.mouseX - curCoords[0];
      var deltaY = ps.mouseY - curCoords[1];
  
      if(buttonDown){
        rot[0] += deltaX / ps.width * 5;
        rot[1] += deltaY / ps.height * 5;
        
        curCoords[0] = ps.mouseX;
        curCoords[1] = ps.mouseY;
      }

      ps.translate(0, 0, zoomed);
      
      ps.rotateY(rot[0]);
      ps.rotateX(rot[1]);

      ps.clear();
      ps.render(cl);
    };
    cl = ps.load(c);
  }
}

////////////////////////////////////
public class Plane{

  private Vector position;
  private Vector direction;
  private PImage img;
  private float angle;
  
  void setImage(PImage img){
    this.img = img;
  }

  void setPosition(PVector pos){
    position = pos;
  }

  void setAngle(float a){
    angle = a;
  }
    
  void setDirection(PVector dir){
    direction = dir;
  }
  
  PVector getDirection(){
    return direction;
  }
  
  void draw(){
    texture(img);
    
    pushMatrix();
    if(position){
      translate(position.x, position.y, position.z);
      scale(10, 10, 10);
    }
    if(angle){
      rotateY(angle);
    }
    
    beginShape(QUADS);
    vertex(-1, -1,  1, 0, 0);
    vertex( 1, -1,  1, 1, 0);
    vertex( 1,  1,  1, 1, 1);
    vertex(-1,  1,  1, 0, 1);
    endShape();
    popMatrix();
  }
  
  void update(float deltaTime){
  }
}

void setup()
{
  size(GAME_WIDTH, GAME_HEIGHT, OPENGL);
  perspective(PI/3.0, width/height, 1, 1000.0);

  pointCloudCanvas = document.getElementById('xbps');
  museumCanvas = document.getElementById('museum');
  museumCanvas.focus();

  wallImg = loadImage("images/wall.jpg");
  floorImg = loadImage("images/floor.jpg");
  
  model = new OBJModel();
  model.load("easel.obj");
  
  acornImg = loadImage("images/acorn.jpg");
  mickeyImg = loadImage("images/mickey.jpg");
  lionImg = loadImage("images/lion.jpg");

  keyboard = new Keyboard();
  user = new User();
  
  easels = new ArrayList();
  walls = new ArrayList();

  for(int i = 0 ; i < 10; i++){
    Plane wall = new Plane();
    wall.setPosition(new PVector(-100, 0, -100 + i * 20));
    wall.setDirection(new PVector(1,0,0));
    wall.setAngle(radians(90));
    wall.setImage(wallImg);
    walls.add(wall);
  }

  // front walls
  for(int i = 0 ; i < 10; i++){
    Plane wall = new Plane();
    wall.setPosition(new PVector(-100 + i *20, 0, -100));
    wall.setDirection(new PVector(0, 0, 1));
    wall.setAngle(radians(0));
    wall.setImage(wallImg);
    walls.add(wall);
  }

  for(int i = 0 ; i < 10; i++){
    Plane wall = new Plane();
    wall.setPosition(new PVector(100, 0, -100 + i *20));
    wall.setDirection(new PVector(-1, 0, 0));
    wall.setAngle(radians(-90));
    wall.setImage(wallImg);
    walls.add(wall);
  }

  // back
  for(int i = 0 ; i < 10; i++){
    Plane wall = new Plane();
    wall.setPosition(new PVector(-100+ i* 20, 0, 100 ));
    wall.setDirection(new PVector(0, 0, -1));
    wall.setAngle(radians(180));
    wall.setImage(wallImg);
    walls.add(wall);
  }

  // center
  easel1 = new Easel();
  easel1.setPosition(new PVector(0, 5, 0));
  easel1.setImage(acornImg);
  easel1.setCloud("../../clouds/acorn.asc");
  easel1.setPointCloudRendering(a);
  easels.add(easel1);

  // front right
  easel2 = new Easel();
  easel2.setPosition(new PVector(60, 5, -60));
  easel2.setDirection(-Math.PI/4);
  easel2.setImage(mickeyImg);
  easel2.setCloud("../../clouds/mickey.asc");
  easel2.setPointCloudRendering(a);
  easels.add(easel2);

  // front left
  easel3 = new Easel();
  easel3.setPosition(new PVector(-60, 5, -60));
  easel3.setDirection(Math.PI/4);
  easel3.setImage(lionImg);
  easel3.setCloud("../../clouds/lion.asc");
  easels.add(easel3);
  
  textureMode(NORMALIZED);
}

void keyReleased(){
  keyboard.setKeyUp(keyCode);
}

void keyPressed(){
  keyboard.setKeyDown(keyCode);
}

void update(float deltaTime){
  userMoving = false;

  if(keyboard.isKeyDown(KEY_LEFT) || keyboard.isKeyDown(KEY_A) ){
    user.turnLeft(deltaTime);
    userMoving = true;
  }
  else if(keyboard.isKeyDown(KEY_RIGHT) || keyboard.isKeyDown(KEY_D) ){
    user.turnRight(deltaTime);
    userMoving = true;
  }
  if(keyboard.isKeyDown(KEY_UP) || keyboard.isKeyDown(KEY_W) ){
    
    PVector position = user.getPosition();
    PVector direction = user.getDirection();
    
    // front
    if(position.z - (direction.z * deltaTime * 30) < -80){
      float amt = 1 + direction.dot(new PVector(0, 0, -1));
      PVector wallPerp = new PVector(direction.x >= 0 ? 1 : -1, 0, 0);            
      wallPerp.x *= max(0.5, amt);
      position.x -= wallPerp.x * deltaTime * 30;
    }
    //back
    else if(position.z - (direction.z * deltaTime * 30) >= 80){
      float amt = 1 + direction.dot(new PVector(0, 0, 1));
      PVector wallPerp = new PVector( direction.x >= 0 ? -1 : 1, 0, 0);
      wallPerp.x *= max(0.5, amt);
      position.x += wallPerp.x * deltaTime * 30;
    }
    // left
    else if(position.x - (direction.x * deltaTime * 30) < -80){
      float amt = 1 + direction.dot(new PVector(-1, 0, 0));
      PVector wallPerp = new PVector(0, 0, direction.z >= 0 ? 1 : -1);
      wallPerp.z *= max(0.5, amt);
      position.z -= wallPerp.z * deltaTime * 30;
    }
    // right
    else if(position.x - (direction.x * deltaTime * 30) >= 80){
      float amt = 1 + direction.dot(new PVector(1, 0, 0));
      PVector wallPerp = new PVector(0, 0, direction.z >= 0 ? -1 : 1);
      wallPerp.z *= max(0.5, amt);
      position.z += wallPerp.z * deltaTime * 30;
    }
    else{
      user.goForward(deltaTime);
    }
    userMoving = true;
  }
  
  if(keyboard.isKeyDown(KEY_DOWN) || keyboard.isKeyDown(KEY_S) ){
//    user.goBackward(deltaTime);
  //  moving = true;
  }
  
  user.update(deltaTime);
}

void draw()
{
  update((millis() - lastTime) / 1000.0f);
  lastTime = millis();
  
  if(userMoving){
    camera(0.0, 0.0, 0.0, 0.0, 0.0, -0.000001, 0, 1, 0);	

    PVector pos = user.getPosition();
    rotateY(-user.getFacing());
    translate(-pos.x, pos.y, -pos.z);

    background(#3366AA);

    pushMatrix();
      translate(0, 10, 0);
      drawFloor();
    popMatrix();

    //
    var closeToEasel = false;
    int i = 0;
    int index = -1;
    for(; i < easels.size(); i++){ 
      Easel e = (Easel)easels.get(i);
      e.draw();
      PVector easelPos = e.getPosition();

      // check to see if the user is near any of the easels
      if(mag(pos.x - easelPos.x, pos.z - easelPos.z) <= 8)
      {
        closeToEasel = true;
        index = i;
      }
    }
    
    if(closeToEasel === false){
     for(int j = 0; j < easels.size(); j++){ 
        Easel e = (Easel)easels.get(j);
        e.endDrawing();
        museumCanvas.focus();
     }
    }
      
    if(closeToEasel){
      museumCanvas.style.opacity = 0.3;
      pointCloudCanvas.style.opacity = 1;
      pointCloudCanvas.focus();
      closeToEasel = true;
      if(index != -1){
        Easel e = (Easel)easels.get(index);
        e.startDrawing();
      }

    }
    else{
      museumCanvas.style.opacity = 1.0;
      pointCloudCanvas.style.opacity = 0;
    }

    noStroke();
    for(int i = 0; i < walls.size(); i++){
      Plane wall = (Plane)walls.get(i);
      PVector two = user.getDirection();
      if(two.dot(wall.getDirection()) > -0.6){
        wall.draw();
      }
    }
  }  
  document.getElementById('debug').innerHTML = Math.floor(frameRate);
}
