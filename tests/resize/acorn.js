var ps, acorn;

var buttonDown = false;
var zoomed = -50;
var rot = [0, 0];
var curCoords = [0, 0];

window.onresize = function(){
  resize();
};

function resize(){
  var windowHeight = window.innerHeight;
  var windowWidth = window.innerWidth;
  
  var cvs = document.getElementById('canvas');
  
  var cvsWidth = parseInt(cvs.style.width);
  var cvsHeight = parseInt(cvs.style.height);
 
  var smallest = windowHeight < windowWidth ? windowHeight : windowWidth;
  
  // make it square
  cvs.style.height = cvs.style.width = smallest;

  cvs.style.top = (windowHeight/2 - smallest/2) + "px";
  cvs.style.left = (windowWidth/2 - cvsWidth/2) + "px";

  ps.resize(smallest, smallest);
  ps.background([0.5, 0.5, 0.5, 1]);
  ps.pointSize(5);
}

function zoom(amt){
  zoomed += amt * 2;
}

function mousePressed(){
  curCoords[0] = ps.mouseX;
  curCoords[1] = ps.mouseY;
  buttonDown = true;
}

function mouseReleased(){
  buttonDown = false;
}

function render(){
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
  
  ps.clear();  
  ps.render(acorn);
}

function start(){
  ps = new PointStream(); 
  ps.setup(document.getElementById('canvas'));
  
  // forse styles to be set
  resize();
  resize();
  
  ps.onRender = render;
  ps.onMouseScroll = zoom;
  ps.onMousePressed = mousePressed;
  ps.onMouseReleased = mouseReleased;
  
  acorn = ps.load("../../clouds/acorn.asc");
}
