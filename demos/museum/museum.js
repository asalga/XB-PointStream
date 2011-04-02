// import processing.opengl.*;
/* @pjs preload="images/floor.jpg,images/acorn.jpg,images/wall.jpg,images/lion.jpg,images/mickey.jpg"; */

var userMoving = false;
var firstTime = true;

window.ps;

/*
var fading = false;
var fadeValue = 0;
var fadingPointCloud = false;
*/
var XBPSHasFocus = false;

float lastTime = 0.0f;

User user;
Keyboard keyboard;
OBJModel podium;

window.pointCloudCanvas;
window.museumCanvas;

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
    console.log(cloud);
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
    podium.drawMode(POLYGON);
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
   if(window.ps && isDrawingCloud){
//     console.log("end Drawing...");
      //fadeValue = 1.0;
      window.ps.stop(cloud);
      window.ps.onRender = function(){};
     // window.ps = null;
    }
  }
  
  void startDrawing(){
    isDrawingCloud = true;
    func(cloud);
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
  size(window.innerWidth, window.innerHeight, OPENGL);
  perspective(PI/3.0, width/height, 1, 1000.0);

  window.pointCloudCanvas = document.getElementById('xbps');
  window.museumCanvas = document.getElementById('museum');
  window.museumCanvas.focus();

  wallImg = loadImage("images/wall.jpg");
  floorImg = loadImage("images/floor.jpg");
  
  podium = new OBJModel();
  podium.load("podium.obj");

  // podium images  
  acornImg = loadImage("images/acorn.jpg");
  mickeyImg = loadImage("images/mickey.jpg");
  lionImg = loadImage("images/lion.jpg");

  keyboard = new Keyboard();
  window.kb = keyboard;
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
  easel3.setPointCloudRendering(a);
  easels.add(easel3);
  
  textureMode(NORMALIZED);
}

void keyReleased(){
  keyboard.setKeyUp(keyCode);
}

void keyPressed(){
  keyboard.setKeyDown(keyCode);
}


void move(PVector position, PVector direction, deltaTime){ 
  // front
  if(position.z - (direction.z * deltaTime * 30) < -80 ){
    float amt = 1 + direction.dot(new PVector(0, 0, -1));
    PVector wallPerp = new PVector(direction.x >= 0 ? 1 : -1, 0, 0);            
    wallPerp.x *= max(0.5, amt);
    position.x -= wallPerp.x * deltaTime * 30;
    
    if(position.x >  80){position.x =  80;}
    if(position.x < -80){position.x = -80;}
  }
  //back
  else if(position.z - (direction.z * deltaTime * 30) >= 80){
    float amt = 1 + direction.dot(new PVector(0, 0, 1));
    PVector wallPerp = new PVector( direction.x >= 0 ? -1 : 1, 0, 0);
    wallPerp.x *= max(0.5, amt);
    position.x += wallPerp.x * deltaTime * 30;
    if(position.x < -80){position.x = -80;}
    if(position.x >  80){position.x =  80;}
  }    
  // left
  else if(position.x - (direction.x * deltaTime * 30) < -80){
    float amt = 1 + direction.dot(new PVector(-1, 0, 0));
    PVector wallPerp = new PVector(0, 0, direction.z >= 0 ? 1 : -1);
    wallPerp.z *= max(0.5, amt);
    position.z -= wallPerp.z * deltaTime * 30;
    if(position.z < -80){position.z = -80;}
    if(position.z >  80){position.z =  80;}
  }
  // right
  else if(position.x - (direction.x * deltaTime * 30) > 80){
    float amt = 1 + direction.dot(new PVector(1, 0, 0));
    PVector wallPerp = new PVector(0, 0, direction.z >= 0 ? -1 : 1);
    wallPerp.z *= max(0.5, amt);
    position.z += wallPerp.z * deltaTime * 30;
    
    if(position.z >  80){position.z = 80;}
    if(position.z < -80){position.z = -80;}
  }

  else{
	  position.x -= direction.x * deltaTime * 30;
	  position.y -= direction.y * deltaTime;
	  position.z -= direction.z * deltaTime * 30;
  }
  userMoving = true;
}

void update(float deltaTime){
  userMoving = false;

  if(keyboard.isKeyDown(KEY_LEFT) || keyboard.isKeyDown(KEY_A) ){
    user.turnLeft(deltaTime);
    userMoving = true;
    
    // if the user clicked on the point cloud canvas  but then
    // pressed a key, assume they want to move away
    //if(XBPSHasFocus){
    //alert('f');
    //}
    
  }
  else if(keyboard.isKeyDown(KEY_RIGHT) || keyboard.isKeyDown(KEY_D) ){
    user.turnRight(deltaTime);
    userMoving = true;
  }
  if(keyboard.isKeyDown(KEY_UP) || keyboard.isKeyDown(KEY_W) ){    
    PVector position = user.getPosition();
    PVector direction = user.getDirection();
    move(position, direction, deltaTime);
  }
  if(keyboard.isKeyDown(KEY_DOWN) || keyboard.isKeyDown(KEY_S) ){
    PVector position = user.getPosition();
    PVector direction = user.getDirection();
    direction = new PVector(-direction.x, direction.y, -direction.z);
    move(position, direction, deltaTime);
  }
  //user.update(deltaTime);
}

void draw()
{
  update((millis() - lastTime) / 1000.0f);
  lastTime = millis();
  
  if(firstTime || userMoving){
    firstTime = false;
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
        window.museumCanvas.focus();
     }
    }
      
    if(closeToEasel){
      window.museumCanvas.style.opacity = 0.3;
      window.pointCloudCanvas.style.opacity = 1;
      window.pointCloudCanvas.focus();
//      window.pointCloudCanvas.hasFocus = true;
      XBPSHasFocus = true;
//      alert(window.pointCloudCanvas.focus);

      window.pointCloudCanvas.style.zIndex = 1;
      window.museumCanvas.style.zIndex = -1;
      
      closeToEasel = true;
      if(index != -1){
        Easel e = (Easel)easels.get(index);
        e.startDrawing();
      }

    }
    
    // If we aren't close to a podium, hide the xbps canvas
    else{
      window.museumCanvas.style.opacity = 1.0;
      window.pointCloudCanvas.style.opacity = 1.0;
            //window.pointCloudCanvas.hasFocus = false;
      
      window.pointCloudCanvas.style.zIndex = -1;
      window.museumCanvas.style.zIndex = 1;
//      window.pointCloudCanvas.onclick = function(){alert('f');};
      
    }

    noStroke();
    for(int i = 0; i < walls.size(); i++){
      Plane wall = (Plane)walls.get(i);
      PVector two = user.getDirection();
      if(two.dot(wall.getDirection()) > -0.7){
        wall.draw();
      }
    }
  }  
  document.getElementById('debug').innerHTML = Math.floor(frameRate);
}


function a(cloudPath){

  var cloud;

  var zoomed = -50;
  var rot = [0, 0];
  
  // Don't waste cycles rendering static point clouds
  // only render if the object is being transformed
  // by the user.
  var curCoords = [0, 0];
  var buttonDown = false;
  var scrolled = false;
  
  if(!window.ps){
    window.ps = new PointStream();
    ps = window.ps;
    ps.setup(document.getElementById('xbps'));
    ps.pointSize(3);
    ps.background([0, 0, 0, 0.5]);    
  }
  // Center the XBPS canvas in the users window
  pointCloudCanvas.style.height = museumCanvas.height - 50;
  var top = window.innerHeight/2 - parseInt(pointCloudCanvas.style.height)/2;
  pointCloudCanvas.style.top = top + "px";

  // make it square
  pointCloudCanvas.style.width = pointCloudCanvas.style.height;
  var left = window.innerWidth/2 - parseInt(pointCloudCanvas.style.width)/2;
  pointCloudCanvas.style.left = left + "px";


  ps.onMouseScroll = function(amt){
    zoomed += amt * 1.0;
    scrolled = true;
  };
  
  ps.onKeyDown = function(){
//  console.log(window.pointCloudCanvas.onClick);
window.pointCloudCanvas.onkeypressed = function(){alert('d');};

//   = function(){alert('f');};
  
  //var kb = window.kb;

  if(keyboard.isKeyDown(37) || keyboard.isKeyDown(65) ||
     keyboard.isKeyDown(39) || keyboard.isKeyDown(68) ||
     keyboard.isKeyDown(38) || keyboard.isKeyDown(87) || 
     keyboard.isKeyDown(40) || keyboard.isKeyDown(83))
    {
    console.log('d');
    }
    console.log('dd');
  }
  
  ps.onMousePressed = function mousePressed(){
    curCoords[0] = window.ps.mouseX;
    curCoords[1] = window.ps.mouseY;
    buttonDown = true;
  };
  
  ps.onMouseReleased = function(){
    buttonDown = false;
  };

  ps.onRender = function(){
  
    if(scrolled || (buttonDown && (ps.mouseX != curCoords[0] ||
      ps.mouseY != curCoords[1]))){
    
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
      
      var center = cloud.getCenter();
      ps.translate(-center[0], -center[1], -center[2]);

      ps.clear();
      ps.render(cloud);
    }
  };
  cloud = ps.load(cloudPath);
}
