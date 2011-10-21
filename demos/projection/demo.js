var psPerspective;
var psOrtho;

var pointCloudOrtho;
var pointCloutPersp;

// Create an orbit camera halfway between the closest and farthest point
var camPerspective = new OrbitCam({closest:50, farthest:100, distance: 100});
var camOrtho = new OrbitCam({closest:10, farthest:100, distance: 100});

var rotationStartCoords = [0, 0];
var rotationStartCoordsO = [0, 0];

var renderedOnce = false;
var renderedOnceO = false;

var isDragging = false;
var isDraggingO = false;

var drawingOrtho = false;
var drawingPerspective = false;

function zoom(amt){
  if(amt < 0){
    camPerspective.goCloser(-amt);
  }
  else{
    camPerspective.goFarther(amt);
  }
  drawingPerspective = true;
  renderPerspective();
}

function zoomOrtho(amt){
  if(amt < 0){
    camOrtho.goCloser(-amt);
  }
  else{
    camOrtho.goFarther(amt);
  }
  drawingOrtho = true;
  renderOrtho();
}

function mousePressed(){
  rotationStartCoords[0] = psPerspective.mouseX;
  rotationStartCoords[1] = psPerspective.mouseY;
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

function renderPerspective(){

  // To keep the logic simple, only render when done.
  if(pointCloutPersp.status !== 3){
    return;
  }

  if(isDragging){
    var mx = psPerspective.mouseX;
    var my = psPerspective.mouseY;
    	
    // how much was the cursor moved compared to last time
    // this function was called?
    var deltaX = mx - rotationStartCoords[0];
    var deltaY = my - rotationStartCoords[1];
		
    // now that the camera was updated, reset where the
    // rotation will start for the next time this function is called.
    rotationStartCoords = [psPerspective.mouseX, psPerspective.mouseY];

    camPerspective.yaw(-deltaX * 0.015);
    camPerspective.pitch(deltaY * 0.015);
  }
  
  if(renderedOnce === false || isDragging || drawingPerspective){
    renderedOnce = true;
    var cam = camPerspective;
    psPerspective.perspective(60, 350/500, 1, 1000);

    var c = pointCloutPersp.getCenter();
    psPerspective.multMatrix(M4x4.makeLookAt(cam.pos, V3.add(cam.pos,cam.dir), cam.up));
    psPerspective.translate(-c[0], -c[1], -c[2]);
  
    psPerspective.clear();
    psPerspective.render(pointCloutPersp);
    document.getElementById('perFPS').innerHTML = Math.round(psPerspective.frameRate);
  }
  drawingPerspective = false;
}

function renderOrtho() {

  // To keep the logic simple, only render when done.
  if(pointCloudOrtho.status !== 3){
    return;
  }

  if(isDraggingO){
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
  
  if(renderedOnceO === false || isDraggingO || drawingOrtho){
    renderedOnceO = true;
    psOrtho.ortho();
    psOrtho.scale(3.5 + 1/camOrtho.distance * 60);
    
    var c = pointCloudOrtho.getCenter();
    psOrtho.multMatrix(M4x4.makeLookAt(camOrtho.pos, V3.add(camOrtho.pos, camOrtho.dir), camOrtho.up));
    psOrtho.translate(-c[0], -c[1],   -c[2]);
  
    psOrtho.clear();
    psOrtho.render(pointCloudOrtho);
    document.getElementById('orthoFPS').innerHTML = Math.round(psOrtho.frameRate);
  }
  
  drawingOrtho = false;
}

function start(){
  psPerspective = new PointStream();
  psPerspective.setup(document.getElementById('canvas'));
  psPerspective.background([0.2, 0.2 ,0.2 ,1]);
  psPerspective.pointSize(4);

  psPerspective.onRender = renderPerspective;
  psPerspective.onMouseScroll = zoom;
  psPerspective.onMousePressed = mousePressed;
  psPerspective.onMouseReleased = mouseReleased;
  
  pointCloutPersp = psPerspective.load("../../clouds/lion_1048K_n.psi");
}

function startOrtho(){
  psOrtho = new PointStream();
  psOrtho.setup(document.getElementById('ortho'));
  psOrtho.background([0.2, 0.2 ,0.2 ,1]);
  psOrtho.pointSize(4);

  psOrtho.attenuation(10, 0, 0);
  
  psOrtho.onRender = renderOrtho;
  psOrtho.onMouseScroll = zoomOrtho;
  psOrtho.onMousePressed = mousePressedO;
  psOrtho.onMouseReleased = mouseReleasedO;
  
  pointCloudOrtho = psOrtho.load("../../clouds/lion_1048K_n.psi");
}
