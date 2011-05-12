var ps, acorn;

// Create an orbit camera halfway between the closest and farthest point
var cam = new OrbitCam({closest:10, farthest:20, distance: 200});

var isDragging = false;
var rotationStartCoords = [0,0];

var zoomed = -50;
var rot = [0, 0];
var curCoords = [0, 0];

function addPNG(){
  var img = document.createElement('img');
  img.setAttribute("width", "100");  
  document.getElementById('thumbnails').appendChild(img);
  img.src = ps.getPNG();
}

function removeAllScreenShots(){
  var thumbnails = document.getElementById('thumbnails');
  
  while(thumbnails.childNodes.length > 0){
    thumbnails.removeChild(thumbnails.childNodes[0]);
  }
}

function zoom(amt){
  var invert = document.getElementById('invertScroll').checked ? -1: 1;
  zoomed += amt * 2 * invert;
  
  if(amt < 0){
    cam.goCloser(-amt);
  }
  else{
    cam.goFarther(amt);
  }   
}

function mousePressed(){
  rotationStartCoords[0] = ps.mouseX;
  rotationStartCoords[1] = ps.mouseY;
  
  isDragging = true;
}

function mouseReleased(){
  isDragging = false;
}

function keyDown(){
  document.getElementById('key').innerHTML = ps.key;
  cam.setPosition([0, cam.closestDistance, 0]);
}

function render(){
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
  
  ps.multMatrix(M4x4.makeLookAt(cam.position, cam.direction, cam.up));
  ps.translate(-cam.position[0], -cam.position[1], -cam.position[2] );
  
  ps.clear();
  
  var c = acorn.getCenter();

  ps.render(acorn);
      
  var status = document.getElementById("fileStatus");
  status.innerHTML = "";
  switch(acorn.status){
    case 1: status.innerHTML = "STARTED";break;
    case 2: status.innerHTML = "STREAMING";break;
    case 3: status.innerHTML = "COMPLETE";break;
    default:break;
  }

  var fps = Math.floor(ps.frameRate);
  if(fps < 1){
    fps = "< 1";
  }
  
  var numPointsAndFPS = document.getElementById("numPointsAndFPS");
  
  if(acorn.getNumPoints() > 0){
    numPointsAndFPS.innerHTML = acorn.getNumPoints() + " points @ " + fps + " FPS";
  }
  else{
    numPointsAndFPS.innerHTML = fps + " FPS";
  }
}

function start(){
  ps = new PointStream();
  document.getElementById('debug').innerHTML += "XB PointStream Version: " + ps.version;
  
  ps.setup(document.getElementById('canvas'));
  
  ps.background([0, 0, 0, 0.5]);
  ps.pointSize(5);

  ps.onRender = render;
  ps.onMouseScroll = zoom;
  ps.onMousePressed = mousePressed;
  ps.onMouseReleased = mouseReleased;
  ps.onKeyDown = keyDown;
  
  acorn = ps.load("../../clouds/acorn.asc");
}
