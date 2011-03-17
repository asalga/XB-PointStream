// import processing.opengl.*;
/* @pjs preload="images/floor.jpg,images/acorn.jpg,images/wall.jpg,images/lion.jpg,images/mickey.jpg"; */

var rot = 0;
var ps, acorn;
var zoomed = 0;

var drawingMuseum = false;
var fading = false;
var fadeValue = 0;

var fadingPointCloud = false;
var viewingPointCloud = false;

final int GAME_WIDTH = 800;
final int GAME_HEIGHT = 500;

PVector pos = new PVector(0,0,0);
PVector dir = new PVector(0,0,-1);

//Plane acornStand;

float rot = 0;

float lastTime = 0.0f;

Plane wall;
User user;
Keyboard keyboard;
OBJModel model;
var pointCloudCanvas;
var museumCanvas;

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

public class Easel{
  private Vector position;
  private Vector direction;
  private PImage img;
  private float angle;
  private String cloud;
  private boolean isDrawingCloud;
  private Plane preview;

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
  
  void draw(){
    
    pushMatrix();
    rotateX(PI);
    translate(position.x,-9,-position.z);
    scale(0.4, 0.15, 0.5);
    model.drawMode(POLYGON);
    popMatrix();

    pushMatrix();
      translate(position.x + 3, position.y, position.z);
      scale(3, 4, 3);
      rotateX(PI/2.0 - 0.2);
      preview.draw();
    popMatrix();
  }
  
  void endDrawing(){
   if(ps && isDrawingCloud){
      fadeValue = 1.0;
      ps.stop(cloud);
      ps.onRender = function(){};
    }
    ps = null;
  }
  
  void startDrawing(){
    isDrawingCloud = true;
    //
    if(!ps){      
      ps = new PointStream();
      ps.setup(document.getElementById('xbps'));
      ps.pointSize(5);
      ps.background([0, 0, 0, 0.5]);

      ps.onMouseScroll = function(amt){
        zoomed += amt * 1.0;
      }

      ps.onRender = function(){
        ps.translate(0, 0, -25 + zoomed);
        ps.rotateX(rot-=0.01);
        ps.clear();
        ps.render(acorn);
      };
      acorn = ps.load(cloud);
    }
  }  
}

////////////////////////////////////
public class Plane{

  private Vector position;
  private PImage img;

  void setImage(PImage img){
    this.img = img;
  }

  void setPosition(PVector pos){
    position = pos;
  }

  void draw(){
    noStroke();
    texture(img);
    beginShape(QUADS);

    vertex(-1, -1,  1, 0, 0);
    vertex( 1, -1,  1, 1, 0);
    vertex( 1,  1,  1, 1, 1);
    vertex(-1,  1,  1, 0, 1);

    endShape();
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

  wall = new Plane();
  wall.setImage(wallImg);
  
  //acornStand = new Plane();
  //acornStand.setImage(acornImg);
  
  easels = new ArrayList();

  // center
  easel1 = new Easel();
  easel1.setPosition(new PVector(0, 5, 0));
  easel1.setImage(acornImg);
  easel1.setCloud("../../clouds/acorn.asc");
  easels.add(easel1);

  // front right
  easel2 = new Easel();
  easel2.setPosition(new PVector(60, 5, -60));
  easel2.setDirection(-Math.PI/4);
  easel2.setImage(mickeyImg);
  easel2.setCloud("../../clouds/mickey.asc");
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
  drawingMuseum = false;
  if(keyboard.isKeyDown(KEY_LEFT)){
    user.turnLeft(deltaTime);
    drawingMuseum = true;
  }
  else if(keyboard.isKeyDown(KEY_RIGHT)){
    user.turnRight(deltaTime);
    drawingMuseum = true;
  }
  if(keyboard.isKeyDown(KEY_UP)){
    user.goForward(deltaTime);
    drawingMuseum = true;
  }
  
  if(keyboard.isKeyDown(KEY_DOWN)){
    user.goBackward(deltaTime);
    drawingMuseum = true;
  }
  
  user.update(deltaTime);
}

void draw()
{
  update((millis() - lastTime) / 1000.0f);
  lastTime = millis();

	camera(0.0, 0.0, 0.0, 0.0, 0.0, -0.000001, 0, 1, 0);	

  PVector pos = user.getPosition();
  rotateY(-user.getFacing());
  translate(-pos.x, pos.y, -pos.z);

  background(#3366AA);

   /* if(fading){  
      fadeValue -= 0.01;
      if(fadeValue >= 0 && fadeValue <= 1 ){
        document.getElementById('xbps').style.opacity = fadeValue;
      }
      if(fadeValue <= 0)
      {
        fading = false;
      }
    }*/

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
    
          /*
          ps = new PointStream();
          ps.setup(document.getElementById('xbps'));
          ps.pointSize(5);
          ps.background([0, 0, 0, 0.5]);

          drawingMuseum = false;
          viewingPointCloud = true;
          
          ps.onMouseScroll = function(amt){
            zoomed += amt * 1.0;
          }

          ps.onRender = function(){
            ps.translate(0, 0, -25 + zoomed);
            ps.rotateX(rot-=0.01);
            ps.clear();
            ps.render(acorn);
          };
          acorn = ps.load("clouds/acorn.asc");
        }*/
        //}
    
    // draw walls
    for(int i = 0 ; i < 10; i++){
      pushMatrix();
        translate(-80 + i *20, 0, 80);
        scale(10, 10, 10);
        wall.draw();
      popMatrix();
    }

    for(int i = 0 ; i < 10; i++){
      pushMatrix();
        translate(-100 + i *20, 0, -100);
        scale(10, 10, 10);
        wall.draw();
      popMatrix();
    }

    for(int i = 0 ; i < 10; i++){
      pushMatrix();
        translate(-100, 0, -100 + i *20);
        rotateY(radians(90));
        scale(10, 10, 10);
        wall.draw();
      popMatrix();
    }
    for(int i = 0 ; i < 10; i++){
      pushMatrix();
        translate(100, 0, -100 + i *20);
        rotateY(radians(-90));
        scale(10, 10, 10);
        wall.draw();
      popMatrix();
    }
  
    pushMatrix();
      translate(100, 0, 100);
      scale(10, 10, 10);
      wall.draw();
    popMatrix();
  
  document.getElementById('debug').innerHTML = Math.floor(frameRate);
}
