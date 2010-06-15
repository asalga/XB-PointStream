var AJAX = new XMLHttpRequest();

//    
var verts = [];
var cols = [];
var norms = [];

//
var MaxX = -10000;
var MaxY = -10000;
var MaxZ = -10000;

var stillDownloading = true;
var s = 3;

var ready = false;
float fps;
var isSetup = false;

// manipulate object
var rotX = 0;
var rotY = 0;
var mouseIsDown = false;
var mouseCoords = [0,0];
var lastX = 0;
var lastY = 0;
var zoom = 0;

Octree octree;
int IDCounter = 0;
int levelToDraw = -1;
int level = -1;
int numOctants = 0;
var octreeSize;

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
      drawSplats(buffer);
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
      if(isLeaf && buffer){
          pushMatrix();
          translate(center.x, center.y, center.z);
          stroke( 255 * (abs(center.x)/octreeSize),
                  255 * (abs(center.y)/octreeSize),
                  255 * (abs(center.z)/octreeSize));
          box(radius/0.95);
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

    


    function parse(){
      var values = AJAX.responseText.split(/\s+/);

      // xyz  rgb  normals
      for(var i = 0, len = values.length; i < len; i += 9){
      
        var currX = parseFloat(values[i+0]) * s; 
        var currY = parseFloat(values[i+1]) * s;
        var currZ = parseFloat(values[i+2]) * s;
        
        verts.push(currX);
        verts.push(currY);
        verts.push(currZ);
                
        if(currX > MaxX){MaxX = currX;}
        if(currY > MaxY){MaxY = currY;}
        if(currZ > MaxZ){MaxZ = currZ;}

        cols.push(parseInt(values[i+3])/255);
        cols.push(parseInt(values[i+4])/255);
        cols.push(parseInt(values[i+5])/255);

        norms.push(parseFloat(values[i+6]));
        norms.push(parseFloat(values[i+7]));
        norms.push(parseFloat(values[i+8]));

        //sss += "<br />" + parseFloat(currX+10) + " " + parseFloat(currY+10) + " " + parseFloat(currZ+10) + " " +
        //values[i+3] + " " + values[i+4] + " " + values[i+5] + " " +
        // values[i+6] + " " + values[i+7] + " " + values[i+8];
      }

      document.getElementById('parse_percent').innerHTML = "done";
      document.getElementById('NumPoints_log').innerHTML = "Number of points: ........";
      document.getElementById('num_points').innerHTML = values.length/9;
      document.getElementById('Octree_log').innerHTML ="Inserting into octree: ...";
      
      stillDownloading = false;
    }
    
    
    function changed(){
    
      if(AJAX.readyState === 4){
      
        document.getElementById('load_percent').innerHTML = "done";
        document.getElementById('Parse_log').innerHTML = "Parsing <span class='filename'>" + filename + "</span>: ......";

        setTimeout(parse, 50);
      }
      else{
      if(filename =="mickey.asc"){
        document.getElementById('load_percent').innerHTML = "" + Math.ceil(100 * AJAX.responseText.length/10636534) + "%";
        }
        else{
          document.getElementById('load_percent').innerHTML = "" + Math.ceil(100 * AJAX.responseText.length/3997253) + "%";
        }
      }
    }


void setup() {  
  AJAX.onreadystatechange = changed;
  AJAX.open("GET", filename, true);
  AJAX.send(null);

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
  document.getElementById('VBO_log').innerHTML = "Creating VBOs: ...........";
    
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
      rotX += (mouseY - mouseCoords[1])/height * 2 * PI;
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
  scale(1,-1,1);
  
  rotateY(rotY);
  rotateX(rotX);
  
  // once per frame
  setMatrices()
  
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