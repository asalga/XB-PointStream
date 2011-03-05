var ps, mickey;
var rotY = 0.0;
var rotX = 0.3;

var buttonDown = false;
var rot = [0, 0];
var curCoords = [0, 0];
var zoomed = -80;

function zoom(amt){
  zoomed += amt * 0.5;
}


function mousePressed(){
  curCoords[0] = ps.mouseX;
  curCoords[1] = ps.mouseY;
  buttonDown = true;
}

function mouseReleased(){
  buttonDown = false;
}


var progObj;
var fps_label;

function render() {
  ps.clear();
  
    var deltaX = ps.mouseX - curCoords[0];
  var deltaY = ps.mouseY - curCoords[1];
  
  if(buttonDown){
    rot[0] += deltaX / ps.width * 5;
    rot[1] += deltaY / ps.height * 5;
    
    curCoords[0] = ps.mouseX;
    curCoords[1] = ps.mouseY;
  }


  // spin object
  rotY += 0.01;
  
  ps.uniformf("lightPos", [0, 150, 10]);
  ps.pushMatrix();
    ps.translate(0, 0, zoomed);
    ps.scale(15,15,15);
    ps.rotateY(rot[0]);
    ps.rotateX(rot[1]);
    ps.render(mickey);
  ps.popMatrix();
  
  fps_label.innerHTML = Math.floor(ps.frameRate) + " FPS";
}

function start(){
  fps_label = document.getElementById("fps");
  
  ps = new PointStream(); 
  ps.setup(document.getElementById('canvas'));
  ps.registerParser("asc", ASCParser);
  ps.onRender = render;
  ps.background([1, 1, 1, 1]);
  
  ps.onMousePressed = mousePressed;
  ps.onMouseReleased = mouseReleased;
  ps.onMouseScroll = zoom;
    
  progObj = ps.createProgram(vertShader, fragShader);
  ps.useProgram(progObj);
  ps.pointSize(1);

  mickey = ps.load("../../clouds/monkey2.asc");
}
