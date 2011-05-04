// import processing.opengl.*;
/* @pjs preload="images/floor.jpg,images/acorn.jpg,images/wall.jpg,images/lion.jpg,images/mickey.jpg"; */

var userMoving = false;
var firstTime = true;

var inPodiumRange = false;
var closeToPodium = false;

float lastTime = 0.0f;

User user;
Keyboard keyboard;
OBJModel podium;

window.ps;
window.pointCloudCanvas;
window.museumCanvas;

ArrayList walls;
ArrayList podiums;

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

var keysDown = new Array(128);

window.addEventListener('keydown', function(e){
  keysDown[e.keyCode] = true;
},false);

window.addEventListener('keyup', function(e){
  keysDown[e.keyCode] = false;
},false);


/*
  Podium for a museum
*/
public class Podium{
  private Vector position;
  private Vector direction;
  private PImage img;
  private float angle;
  private String cloud;
  private boolean isDrawingCloud;
  private Plane preview;
  var func;

  public Podium(){
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
      window.ps.stop(cloud);
      window.ps.clear();
      window.ps.onRender = function(){};
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
  
  void update(float deltaTime){}
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
  
  podiums = new ArrayList();
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

  // center podium 
  Podium podium1 = new Podium();
  podium1.setPosition(new PVector(0, 5, 0));
  podium1.setImage(acornImg);
  podium1.setCloud("../../clouds/acorn.asc");
  podium1.setPointCloudRendering(pointCloudCB);
  podiums.add(podium1);

  // far right podium
  Podium podium2 = new Podium();
  podium2.setPosition(new PVector(60, 5, -60));
  // podium2.setDirection(-Math.PI/4);
  podium2.setImage(mickeyImg);
  podium2.setCloud("../../clouds/mickey.asc");
  podium2.setPointCloudRendering(pointCloudCB);
  podiums.add(podium2);

  // far left podium
  podium3 = new Podium();
  podium3.setPosition(new PVector(-60, 5, -60));
  // podium3.setDirection(Math.PI/4);
  podium3.setImage(lionImg);
  podium3.setCloud("../../clouds/lion_1048K_n.psi");
  podium3.setPointCloudRendering(pointCloudCB);
  podiums.add(podium3);
  
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

  if(keyboard.isKeyDown(KEY_LEFT) || keyboard.isKeyDown(KEY_A) ||
    keysDown[37] || keysDown[65]){
    user.turnLeft(deltaTime);
    userMoving = true;

    // TODO:    
    // if the user clicked on the point cloud canvas  but then
    // pressed a key, assume they want to move away
  }
  else if(keyboard.isKeyDown(KEY_RIGHT) || keyboard.isKeyDown(KEY_D) ||
      keysDown[39] || keysDown[68]){
    user.turnRight(deltaTime);
    userMoving = true;
  }
  if(keyboard.isKeyDown(KEY_UP) || keyboard.isKeyDown(KEY_W) ||
     keysDown[38] || keysDown[87]){
    PVector position = user.getPosition();
    PVector direction = user.getDirection();
    move(position, direction, deltaTime);
  }
  if(keyboard.isKeyDown(KEY_DOWN) || keyboard.isKeyDown(KEY_S) ||
     keysDown[40] || keysDown[83]){
    PVector position = user.getPosition();
    PVector direction = user.getDirection();
    direction = new PVector(-direction.x, direction.y, -direction.z);
    move(position, direction, deltaTime);
  }
}

void draw()
{
  update((millis() - lastTime) / 1000.0f);
  lastTime = millis();
  
  // frameCount hack to force drawing podiums
  if(firstTime || userMoving || frameCount < 50){
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
    
    // draw all the podiums
    for(int i = 0; i < podiums.size(); i++){ 
      Podium p = (Podium)podiums.get(i);
      p.draw();
    }

    // check again to see if the user is close to the podium
    if(closeToPodium === false){
      int i = 0;
      int index = -1;
      for(; i < podiums.size(); i++){ 
        Podium e = (Podium)podiums.get(i);
        PVector podiumPos = e.getPosition();

        // check to see if the user is near any of the podiums
        if(mag(pos.x - podiumPos.x, pos.z - podiumPos.z) <= 8)
        {
          closeToPodium = true;
          index = i;
        }
      }
      if(closeToPodium){
        window.museumCanvas.style.opacity = 0.3;
        window.pointCloudCanvas.style.opacity = 1;
        window.pointCloudCanvas.focus();

        window.pointCloudCanvas.style.zIndex = 1;
        window.museumCanvas.style.zIndex = -1;
      
        closeToPodium = true;
        if(index != -1){
          Podium e = (Podium)podiums.get(index);
          e.startDrawing();
        }
      }
    }
    
    // check to see if the user is leaving a podium
    else{
      if(closeToPodium === true){
        var stillNear = false;

        for(int i = 0; i < podiums.size(); i++){ 
          Podium e = (Podium)podiums.get(i);
          PVector podiumPos = e.getPosition();

          // check to see if the user is near any of the podiums
          if(mag(pos.x - podiumPos.x, pos.z - podiumPos.z) <= 8)
          {
            stillNear = true;
            break;
          }
        }
        
        // left the podium area
        if(stillNear == false){
          for(int j = 0; j < podiums.size(); j++){ 
            Podium e = (Podium)podiums.get(j);
            e.endDrawing();
          }
          
          closeToPodium = false;
          // If we aren't close to a podium, hide the xbps canvas
          window.museumCanvas.focus();
          window.museumCanvas.style.opacity = 1.0;
          window.pointCloudCanvas.style.opacity = 1.0;
          
          window.pointCloudCanvas.style.zIndex = -1;
          window.museumCanvas.style.zIndex = 1;
        } 
      }
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
}


function pointCloudCB(cloudPath){
  var cloud = null;
  var firstTime = true;
  var zoomed = -50;
  var rot = [0, 0];
  
  // Don't waste cycles rendering static point clouds
  // only render if the object is being transformed
  // by the user.
  var curCoords = [0, 0];
  var buttonDown = false;
  var scrolled = false;
  
  if(!window.ps){
    ps = window.ps = new PointStream();
    ps.setup(document.getElementById('xbps'));
    var progObj = ps.createProgram(fixedFunctionVert, fixedFunctionFrag);
    ps.useProgram(progObj);

    ps.pointSize(5);
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
  
  
/*
  if(keyboard.isKeyDown(37) || keyboard.isKeyDown(65) ||
     keyboard.isKeyDown(39) || keyboard.isKeyDown(68) ||
     keyboard.isKeyDown(38) || keyboard.isKeyDown(87) || 
     keyboard.isKeyDown(40) || keyboard.isKeyDown(83))
    {*/
  
  ps.onMousePressed = function mousePressed(){
    curCoords[0] = window.ps.mouseX;
    curCoords[1] = window.ps.mouseY;
    buttonDown = true;
  };
  
  ps.onMouseReleased = function(){
    buttonDown = false;
  };

  ps.onRender = function(){

    // render if we are still streaming or if the user is transforming 
    // the point cloud

    // if the cloud downloaded too quickly, we'll need to test
    // for that case by 
   if( (cloud.status === 3 && firstTime) || 
        cloud.status === 2  || scrolled || 
       (buttonDown && (ps.mouseX != curCoords[0] || ps.mouseY != curCoords[1]))){
      
      if(cloud.status === 3){
        firstTime = false;
      }
      
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
