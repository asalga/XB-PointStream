var ps, pointCloud;
var r1 = 0, r2 = 0, r3 = 0;

// Create an orbit camera halfway between the closest and farthest point
var cam = new OrbitCam({closest:10, farthest:400, distance: 300});
var isDragging = false;
var rotationStartCoords = [0, 0];

function baseLight(light){
  var lightName = "lights" + light.id;
  ps.uniformi( lightName + ".isOn", true);

  ps.uniformf( lightName + ".position", light.position);
  
  if(light.ambient){ps.uniformf( lightName + ".ambient", light.ambient);}
  if(light.diffuse){ps.uniformf( lightName + ".diffuse", light.diffuse);}
  if(light.specular){ps.uniformf( lightName + ".specular", light.specular);}
}

function dirLight(light){
  baseLight(light);
  ps.uniformi( "lights" + light.id + ".type", 1);
}

function pointLight(light){
  baseLight(light);
  var lightName = "lights" + light.id;
  ps.uniformi( lightName + ".type", 2);
  ps.uniformf( lightName + ".attenuation", light.attenuation);
}

function spotLight(light){
  baseLight(light);
  var lightName = "lights" + light.id;
  ps.uniformi( lightName + ".type", 3);

  ps.uniformf( lightName + ".angle", light.angle);
  ps.uniformf( lightName + ".direction", light.direction);
  ps.uniformf( lightName + ".concentration", light.concentration);
  ps.uniformf( lightName + ".attenuation", light.attenuation);
}

function zoom(amt){
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

  var c = pointCloud.getCenter();  
  ps.multMatrix(M4x4.makeLookAt(cam.pos, cam.dir, cam.up));
  ps.translate(-c[0], -c[1], -c[2] );
  
  ps.pushMatrix();

  r1 += 0.035;
  r2 += 0.04;
  r3 -= 0.05;

  var dir;
  var mat;
  
  // 
  ps.loadMatrix([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  ps.rotateZ(r1);
  dir = V3.$(0, 1, 0);
  mat = ps.peekMatrix();
  dir = V3.mul4x4(mat, dir);
  dirLight({id:2, ambient:[0.2, 0.2, 0.2], diffuse:[0,0.7,0], position:dir});
   
  // BLUE POINT LIGHT
  ps.loadMatrix([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  ps.rotateY(r2);
  dir = V3.$(0, 0, 100);
  mat = ps.peekMatrix();
  dir = V3.mul4x4(mat, dir);
  pointLight({id:1, ambient:[0.2, 0.2, 0.2], diffuse:[0,0,1], attenuation:[1,0,0], position: dir});

  // SPOT LIGHT
  ps.loadMatrix([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  ps.multMatrix(M4x4.makeLookAt(cam.pos, V3.add(cam.pos,cam.dir), cam.up));

  ps.rotateY(r3);
  
  var mvm = ps.peekMatrix();
  var nx = 0;
  var ny = 0;
  var nz = -1;
  
  var dir = [mvm[0] * nx + mvm[4] * ny + mvm[8] * nz,
  			 mvm[1] * nx + mvm[5] * ny + mvm[9] * nz,
  			 mvm[2] * nx + mvm[6] * ny + mvm[10] * nz
  ];
  
  pos = V3.$(0, 0, 250);
  mat = ps.peekMatrix();
  newPos = V3.mul4x4(mat, pos);

  spotLight({id:5, angle: .5, concentration:20, attenuation:[1,0,0], diffuse:[1,0,0], direction: dir, position: newPos});
  
  ps.popMatrix();
  
  ps.clear();
  ps.render(pointCloud);      
}

function start(){
  ps = new PointStream();
  ps.setup(document.getElementById('canvas'));
  ps.background([0,0,0,1]);

  var vert = ps.getShaderStr("../../shaders/fixed_function.vs");
  var frag = ps.getShaderStr("../../shaders/fixed_function.fs");
  
  fixedFunctionProg = ps.createProgram(vert, frag);
  ps.useProgram(fixedFunctionProg);

  ps.uniformi("matOn", true);
  ps.uniformf("matShininess", 250);
  ps.uniformf("matAmbient", [0.5, 1, 0.5]);
  ps.uniformf("matDiffuse", [1, 1, 1]);
  ps.uniformf("matSpecular", [1, 1, 0.5]);
   
  ps.pointSize(30.0);
  
  pointCloud = ps.load("../../clouds/andor.ply");
  
  ps.onRender = render;
  ps.onMouseScroll = zoom;
  ps.onMousePressed = mousePressed;
  ps.onMouseReleased = mouseReleased;
}