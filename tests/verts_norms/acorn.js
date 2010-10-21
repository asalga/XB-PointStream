var acorn;
var ps;

var buttonDown = false;
var zoomed = -50;

var rot =[0,0];
var curCoords = [0,0];

/*window.onresize = function(){
  ps.resize(window.innerWidth/2, window.innerHeight/2);
  ps.background([0,0,0,1]);
  ps.pointSize(5);
};*/


function addPNG(){
  var img = document.createElement('img');
  img.setAttribute("width", "100");  
  document.getElementById('thumbnails').appendChild(img);
  img.src = ps.getPNG();
}

/*
  Remove all screenshots
*/
function clearPNG(){
  var test = document.getElementById('thumbnails');
  
  while(test.childNodes){
    test.removeChild(test.childNodes[0]);
  }
}

function zoom(amt){
  var invert = document.getElementById('invertScroll').checked ? -1: 1;
  zoomed += amt * 2 * invert;
  if(buttonDown){
    addPNG();
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

function keyDown(){
  document.getElementById('key').innerHTML = key;
  ps.println(key);
}

function render() {

  var deltaX = ps.mouseX - curCoords[0];
  var deltaY = ps.mouseY - curCoords[1];
  
  if(buttonDown){
    rot[0] += deltaX / ps.width * 5;
    rot[1] += deltaY / ps.height * 5;
    
    curCoords[0] = ps.mouseX;
    curCoords[1] = ps.mouseY;
  }

  // transform point cloud
  ps.translate(0,0,zoomed);
    
  ps.rotateY(rot[0]);
  ps.rotateX(rot[1]);

  var c = acorn.getCenter();
  ps.translate(-c[0],-c[1],-c[2]);
  
  // redraw
  ps.clear();
  ps.render();
      
  var status = document.getElementById('fileStatus');
  switch(acorn.status){
    case 1: status.innerHTML = "status: STARTED";break;
    case 2: status.innerHTML = "status: STREAMING";break;
    case 3: status.innerHTML = "status: COMPLETE";break;
    default:break;
  }

  var fps = Math.floor(ps.frameRate);
  if(fps < 1){
    fps = "< 1";
  }
  
  status.innerHTML += "<br />" + acorn.getPointCount() + " points @ " + fps + " FPS";
}

function start(){
  ps = new PointStream();
  document.getElementById('debug').innerHTML += "XB PointStream Version: " + ps.getVersion();
  
  ps.setup(document.getElementById('canvas'), render);
  
  ps.background([0,0,0,0.5]);
  ps.pointSize(5);

  ps.onMouseScroll = zoom;
  ps.onMousePressed = mousePressed;
  ps.onMouseReleased = mouseReleased;
  ps.keyDown = keyDown;
  
  acorn = ps.loadFile({path:"acorn_vn.asc"});
}
