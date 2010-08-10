var ps;
var lion;

var buttonDown = false;
var zoomed = -50;

var rot =[0,0];
var curCoords = [0,0];

var size = 500;

/*window.onresize = function(){
  ps.resize(window.innerWidth, window.innerHeight);
  ps.background([0,0,0,1]);
};*/

function zoom(amt){
  var invert = document.getElementById('invertScroll').checked ? -1: 1;
  zoomed += amt * 2 * invert;
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
  
  // !!! fix me
  ps.translate(281.32617943646534,205.61656736098982,290.55082983174293);
  
  // redraw
  ps.clear();
  ps.render();
  
  var status = document.getElementById('fileStatus');
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
  
  status.innerHTML += "<br />" + lion.getPointCount() + " points @ " + fps + " FPS";
}

function start(){
  ps = new PointStream();
  
  ps.setup(document.getElementById('canvas'), render);
  
  ps.background([1,1,1,1]);
  ps.pointSize(8);

  ps.onMouseScroll = zoom;
  ps.onMousePressed = mousePressed;
  ps.onMouseReleased = mouseReleased;
  
  lion = ps.loadFile({path:"lion.asc"});
}
