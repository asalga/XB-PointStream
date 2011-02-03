var acorn = null;
var ps = null;
var i = 0.0;

var index = 0;

function render() {

  ps.translate(0, 0, -20);
  ps.rotateY(i += 0.0011);
  
  var c = acorn.getCenter();
  ps.translate(-c[0], -c[1], -c[2]);
  
  ps.clear();
  ps.render(acorn);
  
  var fps = Math.floor(ps.frameRate);
  var fps_label = document.getElementById("fps");
  fps_label.innerHTML = fps + " FPS";
}

function keyDown(){
  index++;
  if(index >= 3){
    index = 0;
  }
  if(index === 0){
    ps.useProgram();
  }
  if(index === 1){
    var programObj = ps.createProgram(cel_vertShader, cel_fragShader);
    ps.useProgram(programObj);
  }
  if(index === 2){
    var programObj = ps.createProgram(scan_vertShader, scan_fragShader);
    ps.useProgram(programObj);
  }

  ps.pointSize(3);
}
  
function start(){
  ps = new PointStream(); 
  ps.setup(document.getElementById('canvas'));
  
  ps.onRender = render;
  ps.onKeyDown = keyDown;
  
  ps.background([0,0,0,1]);
  ps.pointSize(3);
  
  acorn = ps.load("../../clouds/acorn.asc");
}
