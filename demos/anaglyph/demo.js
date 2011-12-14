var ps, pointCloud;
var fixedFunctionProg;

var cam = new OrbitCam({closest:0, farthest:100, distance:10});
var isDragging = false;
var rotationStartCoords = [0, 0];
var drewEntireCloud = false;
var forceRender = false;

function zoom(amt){
  if(amt < 0){
    cam.goCloser(-amt);
  }
  else{
    cam.goFarther(amt);
  }
  forceRender = true;
}

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

function mousePressed(){
  rotationStartCoords[0] = ps.mouseX;
  rotationStartCoords[1] = ps.mouseY;
  
  isDragging = true;
}

function mouseReleased(){
  isDragging = false;
}

function render(){

  if(!forceRender){
    // if finished loading all points, but user isn't interacting
    // with the page, don't bother redrawing
    if((pointCloud.status === 3 && isDragging === false && drewEntireCloud)){
      return;
    }
  }
  
  var ctx = ps.getContext();
  
  ctx.colorMask(1,1,1,1);
  ps.clear();

  ps.perspective(50, canvas.width/canvas.height, 0.01, 1000);
  dirLight({id:0, ambient:[0.4, 0.4, 0.4], diffuse:[.6,.6,.6], position:[0,0,1]});

  if(isDragging === true){		
    // how much was the cursor moved compared to last time
    // this function was called?
    var deltaX = ps.mouseX - rotationStartCoords[0];
    var deltaY = ps.mouseY - rotationStartCoords[1];
		
    // now that the camera was updated, reset where the
    // rotation will start for the next time this function is called.
    rotationStartCoords = [ps.mouseX, ps.mouseY];

    cam.yaw(-deltaX * 0.025);
    cam.pitch(deltaY * 0.025);
  }
  
  var c = pointCloud.getCenter();
  
  // Render cyan
  ps.pushMatrix();

  var p = V3.$(cam.pos[0], cam.pos[1], cam.pos[2]);
  ps.multMatrix(M4x4.makeLookAt( V3.add(p, V3.scale(V3.cross(cam.dir, cam.up), 0.0075)), V3.add(cam.pos, cam.dir), cam.up));

  ps.rotateX(3.14/2);
  ps.translate(-c[0], -c[1], -c[2]);
  
  // CYAN
  ctx.colorMask(0,1,1,1);
  ps.render(pointCloud);
  ps.popMatrix();
  
  //
  ctx.clear(ctx.DEPTH_BUFFER_BIT);

  ps.pushMatrix();

  // ps.multMatrix(M4x4.makeLookAt(cam.pos + V3.cross(cam.dir, cam.up)*0.035, V3.add(cam.pos, cam.dir), cam.up));
  // ps.multMatrix(M4x4.makeLookAt(cam.pos, V3.add(cam.pos, cam.dir), cam.up));
  // ps.multMatrix(M4x4.makeLookAt(cam.pos – V3.cross(cam.dir, cam.up)*0.035, V3.add(cam.pos, cam.dir), cam.up));
  ps.multMatrix(M4x4.makeLookAt( V3.sub(p, V3.scale(V3.cross(cam.dir, cam.up), 0.0075)), V3.add(cam.pos, cam.dir), cam.up));

  ps.rotateX(3.14/2);
  ps.translate(-c[0], -c[1], -c[2]);

  // Only render red channel
  ctx.colorMask(1,0,0,1);

  ps.render(pointCloud);
  ps.popMatrix();
  
  if(pointCloud.status === 3){
    drewEntireCloud = true;
  }
  forceRender = false;
}

function start(){
  ps = new PointStream();
  ps.setup(document.getElementById('canvas'));
  ps.background([0, 0, 0, 1]);

  ps.onRender = render;
  ps.onMouseScroll = zoom;
  ps.onMousePressed = mousePressed;
  ps.onMouseReleased = mouseReleased;

  pointCloud = ps.load("../../clouds/hand.ply");
    
  var vert = ps.getShaderStr("../../shaders/fixed_function.vs");
  var frag = ps.getShaderStr("../../shaders/fixed_function.fs");
  fixedFunctionProg = ps.createProgram(vert, frag);
  ps.useProgram(fixedFunctionProg);  
  ps.pointSize(3);
}
