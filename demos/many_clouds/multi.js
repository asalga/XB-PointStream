var egg = null;
var acorn = null;
var mickey = null;

var r = 0;
var ps = null;

var buttonDown = false;
var zoomed = -50;

var rot =[0, 0];
var curCoords = [0, 0];

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
  var thumbnails = document.getElementById('thumbnails');
  
  while(thumbnails.childNodes.length > 0){
    thumbnails.removeChild(thumbnails.childNodes[0]);
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
}

function render() {
  r += 0.05;
  
  var deltaX = ps.mouseX - curCoords[0];
  var deltaY = ps.mouseY - curCoords[1];
  
  if(buttonDown){
    rot[0] += deltaX / ps.width * 5;
    rot[1] += deltaY / ps.height * 5;
    
    curCoords[0] = ps.mouseX;
    curCoords[1] = ps.mouseY;
  }

  // transform point cloud
  ps.translate(0, 0, zoomed);
    
  ps.rotateY(rot[0]);
  ps.rotateX(rot[1]);

  
  // clear the canvas
  ps.clear();
  
  // draw mickey
  var c = mickey.getCenter();
  ps.translate(-c[0], -c[1], -c[2]);
  ps.pointSize(8);
  ps.render(mickey);

  ps.translate(0, -17, 0);
  ps.render(egg);

  ps.translate(0, 17, 0);
    
  // draw acorn
  ps.pointSize(5);
  ps.translate(c[0], c[1], c[2]);

  ps.translate(15, 28, -8);
  ps.rotateX(0.5);
  ps.rotateY(r);
  c = acorn.getCenter();
  ps.translate(-c[0], -c[1], -c[2]);
  ps.scale(0.8);


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
  
  // 
  if(acorn.getNumParsedPoints() > 0){
    numPointsAndFPS.innerHTML = acorn.getNumParsedPoints() + " points @ " + fps + " FPS";
  }
  else{
    numPointsAndFPS.innerHTML = fps + " FPS";
  }
  
  //numPointsAndFPS.innerHTML += "  " + acorn.attributes["VERTEX"].length;
  
  // total point known?
}

function start(){
  ps = new PointStream();
  document.getElementById('debug').innerHTML += "XB PointStream Version: " + ps.getVersion();
  
  ps.setup(document.getElementById('canvas'), render);
  
  ps.background([0, 0, 0, 0.5]);

  // ps.onRender = 
  ps.onMouseScroll = zoom;
  ps.onMousePressed = mousePressed;
  ps.onMouseReleased = mouseReleased;
  
  // !
  ps.keyDown = keyDown;
  
  acorn = ps.loadFile("../../clouds/acorn.asc");
  mickey = ps.loadFile("../../clouds/mickey.asc");
  egg = ps.loadFile("../../clouds/eggenburg.asc");
}
