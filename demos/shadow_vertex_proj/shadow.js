var ps,
    ctx,
    cloud,
    light;
var shadow;

// Camera and camera control
var cam = new OrbitCam({closest:20, farthest:1000, distance: 100});
cam.setOrbitPoint([0,50,0]);
var rotationStartCoords = [0, 0];
var isDragging;

function mousePressed(){
  isDragging = true;
  rotationStartCoords[0] = ps.mouseX;
  rotationStartCoords[1] = ps.mouseY;
}

function mouseReleased(){
  isDragging = false;
}

function zoom(amt){
  if(amt < 0)
    cam.goCloser(-amt * 10);
  else
    cam.goFarther(amt * 10);
}

function render() {
  ps.clear();
    
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

  ps.multMatrix(M4x4.makeLookAt(cam.pos, V3.add(cam.pos, cam.dir), cam.up));

  // Move the light around
  var x = -200 * Math.cos(ps.frameCount/100);
  var y = 600;
  var z = -200 * Math.sin(ps.frameCount/100);
  var c = cloud.getCenter();

  // Draw a light
  ps.pushMatrix();
  ps.pointSize(10);
  ps.attenuation(1,0, 0);
  ps.translate(x, y, z);
  ps.render(light);
  ps.popMatrix();
  
  // Draw shadow
  ps.pointSize(3);
  ps.attenuation(1,0, 0);
  ps.pushMatrix();
  ps.scale(0.25);
  ps.uniformi("drawShadow", true);
  ps.uniformf("lightPos",[x, y, z]);
  ps.render(shadow);
  ps.popMatrix();

  // Draw cloud
  ps.pointSize(15);
  ps.attenuation(0.05, 0, 0.003);
  ps.uniformi("drawShadow", false);
  ps.translate(-c[0], -c[1]+45, -c[2]);
  ps.render(cloud);
  document.getElementById('debug').innerHTML = Math.floor(ps.frameRate);
}

function start(){
  // put the camera in an interesting place
  cam.pitch(0.8);
  cam.yaw(-1);

  ps = new PointStream();
  ps.setup(document.getElementById('canvas'));
  ctx = ps.getContext();

  // Use a single shader for the cloud and the shadow.
  var vert = ps.getShaderStr("shadow.vs");
  var frag = ps.getShaderStr("shadow.fs");
  progObj = ps.createProgram(vert, frag);
  ps.useProgram(progObj);
  
  ps.onRender = render;
  ps.onMouseScroll = zoom;
  ps.onMousePressed = mousePressed;
  ps.onMouseReleased = mouseReleased;

  ps.pointSize(12.0);

  light = ps.load("../../clouds/point_1.asc");
  cloud = ps.load("../../clouds/ariusman_842K_n.psi");
  shadow = ps.load("../../clouds/shadow_0.asc");  
}
