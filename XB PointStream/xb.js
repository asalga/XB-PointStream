import processing.opengl.*;

int numOctants = 0;

float r = 0.0f;
int levelToDraw = -1;
int level = -1;

var ready = false;
var octreeSize;
boolean drawComplete = true;
boolean drawPoints = true;
float fps;

var isSetup = false;

var rotX = 0;
var rotY = 0;
var mouseIsDown = false;
var mouseCoords = [0,0];
var lastX = 0;
var lastY = 0;
var zoom = 0;

int bufferCounter = 0;
int IDCounter = 0;

Octree octree;

int NUM_POINTS = 50;

class Pointt{
  public float x,y,z;
  Pointt(float xx, float yy, float zz){
    x = xx;
    y = yy;
    z = zz;
  }
  Pointt(){
    x = y = z = 0;
  }
}

Pointt frus = new Pointt(0,0,100);

class Octree{
  
  // When the data is rendered, render the bounds as well?
  private boolean showBounds;
  
  // number of primitives in all the children
  int numPrimitives;
  
  // position of the octant
  private Pointt center;
  private float radius;
  private ArrayList children;
  
  private int numChildren;
  private boolean isBuilt;
  private boolean isLeaf;
  private int dataInChildren;
  var buffer;
  
  var datajs;
  var datacjs;
  var datanjs;
  
  int NodeID;
  
  Octree(float fsize){
    showBounds = true;
    numChildren = 0;
    isLeaf = false;
    numPrimitives = 0;
    dataInChildren = 0;
    radius = fsize;
    isBuilt = false;
    center = new Pointt(0,0,0);
    
    datajs = [];
    datacjs = [];
    datanjs = [];
    
    buffer = null;
    NodeID = IDCounter++;
  }
  
  void createBuffersR(){
    if(isLeaf && datajs.length > 0 ){
      buffer = endBuffer(datajs, datacjs, datanjs);
    }
    else{
      if(numChildren > 0){
        for(int i = 0; i < numChildren; i++){
          Octree o = (Octree)children.get(i);
          o.createBuffersR();
        }
      }
    }
  }
  
  void render(){
    
    if(isLeaf && (data.size() > 0 || datajs.length > 0)){
      //points(buffer);
      box(buffer);
   /*
      for(int i = 0; i < data.size(); i++){
        Pointt p = (Pointt)data.get(i);
        Pointt cl = (Pointt)datac.get(i);
      //  stroke(abs(p.x*5), abs(p.y*5), abs(p.z*5));
//        stroke(cl.x, cl.y, cl.z);
        point(p.x, p.y, p.z, cl.x, cl.y, cl.z);
      }*/
    }
    
    if(drawOctree){
      //if(drawComplete || dataInChildren > 0 || 
      if(isLeaf && buffer){
       // level++;
      
        //if(level == levelToDraw || levelToDraw == -1)

          pushMatrix();
          translate(center.x, center.y, center.z);
         // strokeWeight(1);
          //noStroke();
//          stroke(abs(center.x),150- abs(center.y),abs(center.z));
          stroke( 255 * (abs(center.x)/octreeSize),
                  255 * (abs(center.y)/octreeSize),
                  255 * (abs(center.z)/octreeSize));
          //fill(abs(center.x),150- abs(center.y),abs(center.z));
          box2(radius/0.95);
          popMatrix();
          }

    }
      

    // if the frustum and the current octant intersect
   // if( BoundingSpheresIntersect(frus, 20, center, getRadius()) ){
    
      if(numChildren > 0){
        for(int i = 0; i < numChildren; i++){
          Octree o = (Octree)children.get(i);
          o.render();
        }
     // }
      
    }
    level--;
    
  }
  
  boolean getShowBounds(){
    return showBounds;
  }
  
  void setShowBounds(boolean show){
    showBounds = show;
  }
  
  void setCenter(Pointt c){
    center = c;
  }
  
  Pointt getCenter(){
    return center;
  }
  
  float getRadius(){
    return radius;
  }
  
  void setRadius(float r){
    radius = r;
  }
  
  void insert(Pointt p, Pointt col, Pointt n){

    if(isLeaf){

      datajs.push(p.x);
      datajs.push(p.y);
      datajs.push(p.z);
      
      datacjs.push(col.x);
      datacjs.push(col.y);
      datacjs.push(col.z);

      datanjs.push(n.x);
      datanjs.push(n.y);
      datanjs.push(n.z);
    }
    
    else{

      boolean isInserted = false;
      for(int i=0; !isInserted && i < 8; i++){
        Octree o = (Octree)children.get(i);
        Pointt c = o.getCenter();
        float r = o.getRadius();

        if(p.x > c.x - r/2 && p.x < c.x + r/2 &&
           p.y > c.y - r/2 && p.y < c.y + r/2 &&
           p.z > c.z - r/2 && p.z < c.z + r/2)
        {
          dataInChildren++;
          o.insert(p,col,n);
          
          isInserted = true;
          break;
        }
      }
    }
  }
  
  void build(int maxDepth){
    isBuilt = true;
    
    if(maxDepth <= 0){
      isLeaf = true;
      data = new ArrayList();
      datac = new ArrayList();
      
      return;
    }
    
    else{
      children = new ArrayList();
      numChildren = 8;
    
      for(int i = 0; i < 8; i++){
        Pointt p = new Pointt();
        
        switch(i){
          case 0: p.x = -1;  p.y =  1; p.z =  1;break;
          case 1: p.x = -1;  p.y = -1; p.z =  1;break;
          case 2: p.x =  1;  p.y = -1; p.z =  1;break;
          case 3: p.x =  1;  p.y =  1; p.z =  1;break;
          case 4: p.x = -1;  p.y =  1; p.z = -1;break;
          case 5: p.x = -1;  p.y = -1; p.z = -1;break;
          case 6: p.x =  1;  p.y = -1; p.z = -1;break;
          case 7: p.x =  1;  p.y =  1; p.z = -1;break;
        }
        
        p.x = p.x * radius/4.0f + center.x;
        p.y = p.y * radius/4.0f + center.y;
        p.z = p.z * radius/4.0f + center.z;
        
        Octree octree = new Octree(radius);
        octree.setCenter(p);
        octree.setRadius(radius/2.0f);
        octree.build(maxDepth-1);
        children.add(octree);
        numOctants++;
      }
    }
  }
}


void setup() {
  size(500, 500, OPENGL);
  
  stroke(255);
  strokeWeight(2);
  
  level = -1;
}


void draw(){


if(stillDownloading === false){

  MaxX = abs(MaxX);
  MaxY = abs(MaxY);
  MatZ = abs(MaxZ);

  octreeSize = MaxX;
  if(MaxY > octreeSize){octreeSize = MaxY;}
  if(MaxZ > octreeSize){octreeSize = MaxZ;}

  octree = new Octree(octreeSize*2.0);
  octree.build(3);
  
  for(int i = 0; i < verts.length; i+=3)
  {
    octree.insert(new Pointt(verts[i], verts[i+1], verts[i+2]),
                  new Pointt(cols[i], cols[i+1], cols[i+2]),
                  new Pointt(norms[i], norms[i+1], norms[i+2]));
  }
  
  document.getElementById('octree_percent').innerHTML = "done";
  document.getElementById('vbo_title').innerHTML = "Creating VBOS: ...........";
    
  octree.createBuffersR();
  document.getElementById('vbo_progress').innerHTML = "done";
  
  var lightControl = document.createElement('input');
  lightControl.setAttribute('checked', 'checked');
  lightControl.setAttribute('type', 'checkbox');  
  lightControl.setAttribute('onClick', 'lightOn = !lightOn;');
  
  var octreeControl = document.createElement('input');
  octreeControl.setAttribute('checked', 'checked');
  octreeControl.setAttribute('type', 'checkbox');
  octreeControl.setAttribute('onClick', 'drawOctree = !drawOctree;');  

  document.getElementById('controls').appendChild(document.createTextNode("Light: "));
  document.getElementById('controls').appendChild(lightControl);

  document.getElementById('controls').appendChild(document.createElement("br"));

  document.getElementById('controls').appendChild(document.createTextNode("Draw octree: "));
  document.getElementById('controls').appendChild(octreeControl);
  
  stillDownloading = true;
  ready = true;
}

if(ready){
  background(33,66,99);
  
  // mouseMoved() seems broken...
  if(mouseIsDown){
    if(lastX != mouseX){
      rotY += (mouseX - mouseCoords[0])/width * 2 * PI;
      rotX += (mouseCoords[1]- mouseY)/height * 2 * PI;
      mouseCoords[0] = mouseX;
      mouseCoords[1] = mouseY;
    }
    lastY = mouseY;
    lastX = mouseX;
  }


 if(lightOn){
    // (point light) not a directional light, check shader
    directionalLight(255, 255, 255,  400, 0, -500);
  }

  translate(width/2, height/2, 300 + zoom);
  
  rotateY(rotY);
  rotateX(rotX);
  
  octree.render();

  document.getElementById('fps').innerHTML = "FPS: " + floor(frameRate);
  }
}


boolean BoundingSpheresIntersect(Pointt sphere1Pos, float sphere1Rad, Pointt sphere2Pos, float sphere2Rad){
  PVector v = new PVector(sphere1Pos.x-sphere2Pos.x-width/4, sphere1Pos.y-sphere2Pos.y-height/4, sphere1Pos.z-sphere2Pos.z);
  return v.mag() < sphere1Rad + sphere2Rad;
}

void mousePressed(){
  mouseCoords[0] = mouseX;
  mouseCoords[1] = mouseY;
  lastX = mouseX;
  lastY = mouseY;
  mouseIsDown = true;
}

function scroll(event) {
  if(event.detail > 0 && zoom + event.detail < 300 ||
     event.detail < 0 && zoom - event.detail > -50){
    zoom += event.detail;
  }
}

window.addEventListener("DOMMouseScroll",  scroll, false);
   
void mouseReleased(){
  mouseIsDown = false;
  mouseCoords[0] = mouseX;
  mouseCoords[1] = mouseY;
}