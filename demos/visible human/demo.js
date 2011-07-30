var ps, cloud;
var progObj;
var test = 0;
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
  test += amt* 100;
}

function mousePressed(){
  rotationStartCoords[0] = ps.mouseX;
  rotationStartCoords[1] = ps.mouseY;
  isDragging = true;
}

function mouseReleased(){
  isDragging = false;
}

function blah(){
  var min = $("#slider").slider("option","values")[0];
  var max = $("#slider").slider("option","values")[1];
  
  ps.uniformf("minClip", min);
  ps.uniformf("maxClip", max);
  
  // file and fix this mess later!
  var d = cam.distance;
  var p = cam.orbitPoint;
  cam.setOrbitPoint([p[0], ((900-(min + max)/2))*0.15, p[2]]);
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

  var c = cloud.getCenter();

  ps.multMatrix(M4x4.makeLookAt(cam.pos, V3.add(cam.pos,cam.dir), cam.up));
  ps.rotateY(Math.PI);
  ps.rotateX(Math.PI/2);

  ps.scale(0.15);
  ps.translate(-c[0], -c[1], -c[2]);
  
  ps.clear();
  ps.render(cloud);
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
  ps.pointSize(40);

  ps.onRender = render;
  ps.onMouseScroll = zoom;
  ps.onMousePressed = mousePressed;
  ps.onMouseReleased = mouseReleased;
//  cam.setOrbitPoint([0,0,0]);

  ps.uniformf("minClip", 0);
  ps.uniformf("maxClip", 2800);


  cloud = ps.load("../../clouds/visiblehuman.asc");
}
