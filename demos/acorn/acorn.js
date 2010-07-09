var ps;

var buttonDown = false;
var zoomed = -50;

var rot =[0,0];
var curCoords = [0,0];

window.onresize = function(){
  ps.resize(window.innerWidth, window.innerHeight);
  ps.background([0,0,0,1]);
  ps.pointSize(5);
};

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
  
  ps.attenuation( $("#constant").slider("value"),
                  $("#linear").slider("value"),
                  $("#quadratic").slider("value"));
   
  document.getElementById('const').innerHTML = $("#constant").slider("value");
  document.getElementById('lin').innerHTML = $("#linear").slider("value");
  document.getElementById('quad').innerHTML = $("#quadratic").slider("value");

  // redraw
  ps.clear();
  ps.render();
}

function start(){
  ps = new PointStream();
  
  ps.setup(document.getElementById('canvas'), render);
  
  ps.background([0,0,0,1]);
  ps.pointSize(5);

  ps.onMouseScroll = zoom;
  ps.onMousePressed = mousePressed;
  ps.onMouseReleased = mouseReleased;
  
  ps.loadFile({path:"acorn.asc", autoCenter: true});
}
