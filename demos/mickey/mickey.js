var ps;
var mickey;

var buttonDown = false;
var zoomed = -50;

var rot =[0,0];
var curCoords = [0,0];

var size = 500;

window.onresize = function(){
  ps.resize(window.innerWidth, window.innerHeight);
  ps.background([0.3,0.5,0.7,0.2]);
};

function zoom(amt){
  zoomed += amt * 2;
  size += amt * 10;
}

function mousePressed(){
  curCoords[0] = ps.mouseX;
  curCoords[1] = ps.mouseY;
  buttonDown = true;
}

function mouseReleased(){
  buttonDown = false;
}

function render() {
//document.getElementById('debug').innerHTML +="r";
  var deltaX = ps.mouseX - curCoords[0];
  var deltaY = ps.mouseY - curCoords[1];
  
  if(buttonDown){
    rot[0] += deltaX / 250;
    rot[1] += deltaY / 250;
    curCoords[0] = ps.mouseX;
    curCoords[1] = ps.mouseY;
  }

  // transform point cloud
  ps.translate(0,0,zoomed);
    
  ps.rotateY(rot[0]);
  ps.rotateX(rot[1]);
  
  var c = mickey.getCenter();
  
  ps.translate(-c[0],-c[1],-c[2]);
  
  // redraw
  ps.clear();
  ps.render();

  window.status = mickey.getPointCount() + " points @ " + Math.floor(ps.frameRate) + "FPS";
}

function start(){
  ps = new PointStream();
  
  ps.setup(document.getElementById('canvas'), render);
  
  ps.pointSize(8);
  ps.background([0.3,0.5,0.7,0.2]);

  ps.onMouseScroll = zoom;
  ps.onMousePressed = mousePressed;
  ps.onMouseReleased = mouseReleased;
  
  mickey = ps.loadFile({path:"mickey.asc", autoCenter: true});
}
