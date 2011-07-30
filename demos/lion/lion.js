var ps, lion;

// Create an orbit camera halfway between the closest and farthest point
var  cam = new OrbitCam({closest:10, farthest:100, distance: 100});
var rotationStartCoords = [0, 0];
var isDragging = false;

const KEY_ESC = 27;

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
  if(ps.key == KEY_ESC){
    ps.stop("../../clouds/lion_1048K_n.psi");
  }
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
  
  var status = document.getElementById('fileStatus');
  status.innerHTML = "";
  switch(lion.status){
    case 1: status.innerHTML = "status: STARTED";break;
    case 2: status.innerHTML = "status: STREAMING";break;
    case 3: status.innerHTML = "status: COMPLETE";break;
    default:break;
  }
  
  var fps = Math.floor(ps.frameRate);
  if(fps < 1){
    fps = "< 1";
  }
  
  status.innerHTML  += "<br />" 
                    + addCommas(lion.getNumPoints())
                    + " points @ " + fps + " FPS";
}

/*
  @param {Number} value Number to convert
  @returns {String} Number separated with commas
*/
function addCommas(value){
  var withCommas = "";
  var valueStr = "" + value;
  
  var counter = valueStr.length-1;
  var i = 1;
  for(;counter >= 0; counter--, i++){
    withCommas += valueStr[counter];

    if(i % 3 === 0 && counter > 0){
      withCommas += ",";
    }
  }

  var correctOrder = "";
  for(i = 0; i < withCommas.length; i++){
    correctOrder += withCommas[withCommas.length-1-i];
  }

  return correctOrder;
}

function start(){
  ps = new PointStream();
  ps.setup(document.getElementById('canvas'));
  ps.background([0.2, 0.2 ,0.2 ,1]);
  ps.pointSize(8);

  ps.onRender = render;
  ps.onMouseScroll = zoom;
  ps.onMousePressed = mousePressed;
  ps.onMouseReleased = mouseReleased;
  ps.onKeyDown = keyDown;
  
  lion = ps.load("../../clouds/lion_1048K_n.psi");
}
