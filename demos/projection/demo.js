var ps, lion;
var psOrtho, pointCloudOrtho;

// Create an orbit camera halfway between the closest and farthest point
var cam = new OrbitCam({closest:10, farthest:100, distance: 100});
var camOrtho = new OrbitCam({closest:10, farthest:100, distance: 100});

var rotationStartCoords = [0, 0];
var rotationStartCoordsO = [0, 0];

var isDragging = false;
var isDraggingO = false;

function zoom(amt){
  if(amt < 0){
    cam.goCloser(-amt);
  }
  else{
    cam.goFarther(amt);
  }
}

function zoomO(amt){
  if(amt < 0){
    camOrtho.goCloser(-amt);
  }
  else{
    camOrtho.goFarther(amt);
  }
}

function mousePressed(){
  rotationStartCoords[0] = ps.mouseX;
  rotationStartCoords[1] = ps.mouseY;
  isDragging = true;
}


function mousePressedO(){
  rotationStartCoordsO[0] = psOrtho.mouseX;
  rotationStartCoordsO[1] = psOrtho.mouseY;
  isDraggingO = true;
}

function mouseReleased(){
  isDragging = false;
}

function mouseReleasedO(){
  isDraggingO = false;
}

function render() {
  if(isDragging === true){		
    // how much was the cursor moved compared to last time
    // this function was called?
    var deltaX = ps.mouseX - rotationStartCoords[0];
    var deltaY = ps.mouseY - rotationStartCoords[1];
		
    // now that the camera was updated, reset where the
    // rotation will start for the next time this function is called.
    rotationStartCoords = [ps.mouseX, ps.mouseY];

    cam.yaw(-deltaX * 0.015);
    cam.pitch(deltaY * 0.015);
  }
  
  var c = lion.getCenter();
  ps.multMatrix(M4x4.makeLookAt(cam.pos, V3.add(cam.pos,cam.dir), cam.up));
  ps.translate(-c[0], -c[1], -c[2]);
  
  ps.clear();
  ps.render(lion);  
}

function renderOrtho() {
  if(isDraggingO === true){		
    // how much was the cursor moved compared to last time
    // this function was called?
    var deltaX = psOrtho.mouseX - rotationStartCoordsO[0];
    var deltaY = psOrtho.mouseY - rotationStartCoordsO[1];
		
    // now that the camera was updated, reset where the
    // rotation will start for the next time this function is called.
    rotationStartCoordsO = [psOrtho.mouseX, psOrtho.mouseY];

    camOrtho.yaw(-deltaX * 0.015);
    camOrtho.pitch(deltaY * 0.015);
  }
  
  psOrtho.ortho();
  psOrtho.scale(3.5 + 1/camOrtho.distance * 60);
  var c = pointCloudOrtho.getCenter();
  psOrtho.multMatrix(M4x4.makeLookAt(camOrtho.pos, V3.add(camOrtho.pos, camOrtho.dir), camOrtho.up));
  psOrtho.translate(-c[0], -c[1], -c[2]);
  
  psOrtho.clear();
  psOrtho.render(pointCloudOrtho);  
}

function start(){
  ps = new PointStream();
  ps.setup(document.getElementById('canvas'));
  ps.background([0.2, 0.2 ,0.2 ,1]);
  ps.pointSize(3);

  ps.onRender = render;
  ps.onMouseScroll = zoom;
  ps.onMousePressed = mousePressed;
  ps.onMouseReleased = mouseReleased;
  
  lion = ps.load("../../clouds/lion_1048K_n.psi");
}

function startOrtho(){
  psOrtho = new PointStream();
  psOrtho.setup(document.getElementById('ortho'));
  psOrtho.background([0.2, 0.2 ,0.2 ,1]);
  psOrtho.pointSize(3);

  psOrtho.attenuation(10, 0, 0);
    
  psOrtho.onRender = renderOrtho;
  psOrtho.onMouseScroll = zoomO;
  psOrtho.onMousePressed = mousePressedO;
  psOrtho.onMouseReleased = mouseReleasedO;
  
  pointCloudOrtho = psOrtho.load("../../clouds/lion_1048K_n.psi");
}
