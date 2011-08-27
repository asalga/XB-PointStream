var ps;
var progObj;
var clouds = [];

// Create an orbit camera halfway between the closest and farthest point
var cam = new OrbitCam({closest:10, farthest:1000, distance:800});

var isDragging = false;
var rotationStartCoords = [0, 0];

function zoom(amt){
  if(amt < 0){
    cam.goCloser(-amt * 10);
  }
  else{
    cam.goFarther(amt * 10);
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

function horizSlide(){
  var min = $("#hslider").slider("option","values")[0];
  var max = $("#hslider").slider("option","values")[1];
  
  ps.uniformf("minHorizClip", min);
  ps.uniformf("maxHorizClip", max);
  
  // file and fix this mess!
  var d = cam.distance;
  var p = cam.orbitPoint;
}

function slidey(){
  var min = 2800 - $("#vslider").slider("option","values")[0];
  var max = 2800 - $("#vslider").slider("option","values")[1];
  
  ps.uniformf("minVertClip", min);
  ps.uniformf("maxVertClip", max);
  
  // file and fix this mess!
  var d = cam.distance;
  var p = cam.orbitPoint;
  cam.setOrbitPoint([p[0], ((1400-(min + max)/2))*0.1 - 40, p[2]]);
  cam.setDistance(d);
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

    cam.yaw(-deltaX * 0.02);
    cam.pitch(deltaY * 0.02);
	}

  var c = clouds[0].getCenter();

  ps.multMatrix(M4x4.makeLookAt(cam.pos, V3.add(cam.pos,cam.dir), cam.up));
  ps.rotateY(Math.PI);
  ps.rotateX(Math.PI/2);

  ps.scale(0.15);
  ps.translate(-c[0], -c[1], -c[2]);
  
  ps.clear();
  
  var test = (cam.distance - 400)/100;
  test *= 2.25;
  test = 9 - test;
  
  if(test > 9){ test = 9;}
  if(test < 0){test = 0;}
  
  var points = 0;
  for(var i = 0; i <= test; i++){
    ps.render(clouds[i]);
    points += clouds[i].numPoints;
  }
  
  
  document.getElementById('debug').innerHTML = "FPS: " + Math.round(ps.frameRate);
  document.getElementById('debug').innerHTML += "<br />LOD: " + Math.round(test+1);
  document.getElementById('debug').innerHTML += "<br />Points: " + points;
}

function start(){
  ps = new PointStream();
  ps.setup(document.getElementById('cvs'));
  
  var vert = ps.getShaderStr("clip.vs");
  var frag = ps.getShaderStr("clip.fs");
  
  progObj = ps.createProgram(vert, frag);
  ps.useProgram(progObj);
  
  ps.perspective(30, 1, 0.1, 4000);
  
  ps.background([0, 0, 0, 1]);
  ps.pointSize(20);

  ps.onRender = render;
  ps.onMouseScroll = zoom;
  ps.onMousePressed = mousePressed;
  ps.onMouseReleased = mouseReleased;
  cam.setOrbitPoint([0,-40,0]);

  ps.uniformf("minVertClip", 2800);
  ps.uniformf("maxVertClip", 0);
  ps.uniformf("minHorizClip", 0);
  ps.uniformf("maxHorizClip", 500);
  
  for(var i = 0; i < 10; i++){
    clouds[i] = ps.load("../../clouds/human_" + i + ".asc");
  }
}
