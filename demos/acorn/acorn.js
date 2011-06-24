var ps, acorn;
var r = 0;
var r2 =  0;
// Create an orbit camera halfway between the closest and farthest point
var cam = new OrbitCam({closest:10, farthest:100, distance: 70});
var isDragging = false;
var rotationStartCoords = [0, 0];

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
 
  ps.pushMatrix();
  ps.loadMatrix([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  ps.rotateY(r+=0.1);
  ps.translate(0,0,1000);
  var mat = ps.peekMatrix();  
  
  var vec = V3.$(0, 0, 0);
  var newpos = V3.mul4x4(mat, vec);
        
  ps.uniformi("lights0.isOn", false);  
  ps.uniformf("lights0.ambient",  [0.1,0.1,0.1]);
  ps.uniformf("lights0.position", newpos);  
  ps.uniformf("lights0.specular", [0, 1, 0]);
  
  ps.loadMatrix([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  ps.rotateZ(r2+=0.1);
  ps.translate(100,0,100);
  mat = ps.peekMatrix();
  
  vec = V3.$(0, 0, 0);
  newpos = V3.mul4x4(mat, vec);
  
  ps.uniformi("lights1.isOn", false);
  ps.uniformi("lights1.type", 2);
  ps.uniformf("lights1.position", newpos);
  ps.uniformf("lights1.diffuse", [0.7, 0.7, 0.7]);
  ps.uniformf("lights1.specular", [1, 0, 0]);



ps.popMatrix();  



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

  var c = acorn.getCenter();  
  ps.multMatrix(M4x4.makeLookAt(cam.position, cam.direction, cam.up));
  ps.translate(-cam.position[0]-c[0], -cam.position[1]-c[1], -cam.position[2]-c[2] );
  
  
  
  
  
  
  ps.pushMatrix();
  ps.loadMatrix([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  //ps.multMatrix(M4x4.makeLookAt(cam.position, cam.direction, cam.up));
  
 
  ps.rotateY(r2+=0.1);//,cam.direction);
 // ps.translate(0,0,1);  
  ps.translate(-cam.position[0], -cam.position[1], -cam.position[2] );
   
  vec = V3.$(0, 0, 1);
  mat = ps.peekMatrix();
  newpos = V3.mul4x4(mat, vec);

  ps.uniformi("lights2.isOn", true);
  ps.uniformi("lights2.type", 1);
  ps.uniformf("lights2.ambient",  [0.1, 0.1, 0.1]);
  ps.uniformf("lights2.diffuse",  [0.3, 0.9, 0.3]);
  ps.uniformf("lights2.position", newpos);
  ps.popMatrix();
  

  
  
  
  
  ps.clear();
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
  ps.background([1, 1, 1, 1.0]);

  var vert = ps.getShaderStr("../../shaders/fixed_function.vs");
  var frag = ps.getShaderStr("../../shaders/fixed_function.fs");
  
  fixedFunctionProg = ps.createProgram(vert, frag);
  ps.useProgram(fixedFunctionProg);


  ps.uniformi("matOn", 0);
  ps.uniformf("matShininess", 100);
  ps.uniformf("matAmbient", [0.3, 0.3, 0.3]); // 204/255
  ps.uniformf("matDiffuse", [1, 1, 1]); // 51/255
  ps.uniformf("matSpecular", [0.7, 1, 1]);
  
   
/*  ps.uniformi("matOn", 1);
  ps.uniformf("matShininess", 18);
  ps.uniformf("matAmbient", [0.8, 0.8, 0.8]); // 204/255
  ps.uniformf("matDiffuse", [0.2, 0.2, 0.2]); // 51/255
  ps.uniformf("matSpecular", [1, 1, 1]);
  
  ps.uniformf("lights0.ambient",  [0.3, 0.3, 0.3]);
  ps.uniformf("lights0.diffuse",  [0.7, 0.7, 0.7]);
  ps.uniformf("lights0.specular", [0.1, 0.1, 0.1]);
  ps.uniformf("lights0.position", [0, 0, 10]);*/
  
  ps.pointSize(3.0);

  acorn = ps.load("../../clouds/Mickey_Mouse.psi");
  
  ps.onRender = render;
  ps.onMouseScroll = zoom;
  ps.onMousePressed = mousePressed;
  ps.onMouseReleased = mouseReleased;
  ps.onKeyDown = keyDown;
}
