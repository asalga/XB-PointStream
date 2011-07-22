var ps, mickey;
var usingOrtho = true;

var buttonDown = false;
var zoomed = -50;

var rot = [0, 0];
var curCoords = [0, 0];

function zoom(amt){
  var invert = document.getElementById('invertScroll').checked ? -1 : 1;
  zoomed += amt * 2 * invert;
  if(zoomed < -50){
    zoomed = -50;
  }
  if(zoomed > 0){
    zoomed = 0;
  }
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
  
  if(usingOrtho){
    ps.ortho();
    ps.scale(30+zoomed/2, 30+zoomed/2, 30+zoomed/2);
    ps.attenuation(10, 0, 0);
    ps.pointSize(15 + zoomed/5);
  }
  else{
    ps.perspective();
    ps.translate(0,0, -10 + zoomed);
    ps.attenuation(0, 0.01, 0.03);
    ps.pointSize(10);
  }
  
  ps.rotateY(rot[0]);
  ps.rotateX(rot[1]);
  
  var c = mickey.getCenter();
  ps.translate(-c[0], -c[1], -c[2]);
  ps.clear();
  ps.render(mickey);
  
  var status = document.getElementById('fileStatus');
  status.innerHTML = "";
  
  switch(mickey.status){
    case 1: status.innerHTML = "status: STARTED";break;
    case 2: status.innerHTML = "status: STREAMING";break;
    case 3: status.innerHTML = "status: COMPLETE";break;
    default:break;
  }
  
  var fps = Math.floor(ps.frameRate);
  if(fps < 1){
    fps = "< 1";
  }
  
  status.innerHTML += "<br />" + mickey.getNumPoints() + " points @ " + fps + " FPS";
}

function keyDown(){
  usingOrtho = !usingOrtho;
}

function start(){
  ps = new PointStream();
  ps.setup(document.getElementById('canvas'), {"antialias":true});
  
  ps.pointSize(8);
  ps.background([0.3, 0.5, 0.6, 0.6]);

  ps.onRender = render;

  ps.onKeyDown = keyDown;
  ps.onMouseScroll = zoom;
  ps.onMousePressed = mousePressed;
  ps.onMouseReleased = mouseReleased;
  
  mickey = ps.load("../../clouds/mickey_156K_baked.psi");
}
