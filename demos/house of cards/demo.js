var ps, cloud;
var cam = new OrbitCam({closest:0, farthest:500, distance: 300});
var isDragging = false;
var rotationStartCoords = [0, 0];

var frame = 1;
var last = 1;

function mousePressed(){
  rotationStartCoords[0] = ps.mouseX;
  rotationStartCoords[1] = ps.mouseY;
  isDragging = true;
}

function mouseReleased(){
  isDragging = false;
}

function zoom(amt){
  if(amt < 0){
    cam.goCloser(-amt * 10);
  }
  else{
    cam.goFarther(amt * 10);
  }  
}

function render(){
  var elapsed = Date.now() - begin.getTime();
 
  ps.uniformi("millis", elapsed);  

  frame = parseInt( elapsed / 33, 10);

  // no frame 0
  if(frame === 0){
    frame = 1;
  }
  
  // render can be called several times for the same frame
  // so only parse the frame if it is actually the next one.
  if(last !== frame && frame < 2101){
    last = frame;
    cloud = ps.load("clouds/" + frame + ".csv");
  }

 if(isDragging === true){		
    var deltaX = ps.mouseX - rotationStartCoords[0];
    var deltaY = ps.mouseY - rotationStartCoords[1];
    rotationStartCoords = [ps.mouseX, ps.mouseY];
    cam.yaw(-deltaX * 0.02);
    cam.pitch(-deltaY * 0.02);
  }

  ps.scale(1,-1,1);
  ps.multMatrix(M4x4.makeLookAt(cam.pos, V3.add(cam.pos, cam.dir), cam.up));

  // Since some frames are skipped, this will prevent flashing
  if(cloud.progress === 1){
    ps.clear();
  }
  ps.render(cloud);
}
  
function start(){
  ps = new PointStream(); 
  ps.setup(document.getElementById('canvas'));

  ps.onMouseScroll = zoom;
  ps.onMousePressed = mousePressed;
  ps.onMouseReleased = mouseReleased;

  var vert = ps.getShaderStr("shader.vs");
  var frag = ps.getShaderStr("shader.fs");
  var progObj = ps.createProgram(vert, frag);
  ps.useProgram(progObj);

  ps.registerParser("csv", CSV_Parser);
  ps.onRender = render;

  ps.pointSize(13.0);  
  ps.background([0,0,0,1]);

  // This is roughly the center of the first frame
  cam.setOrbitPoint([92.2343,127.2196,-110.2614]);

  // start with a mugshot
  cam.yaw(Math.PI/2);

  cloud = ps.load("clouds/1.csv");

  begin = new Date();
}
