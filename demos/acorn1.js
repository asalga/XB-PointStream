document.addEventListener('DOMContentLoaded', start, false);

var t = 0;
var ps;
var acorn;
var r = 0;

function render(){

  ps.rotateY(r);
  ps.rotateX(r+=0.01);
  ps.rotateZ(r);
  
  ps.clear();
  ps.render();
  window.status = Math.floor(ps.frameRate);
}

function start(){
  ps = new PointStream();
  ps.setup(document.getElementById('canvas'), render);
  ps.background([0,0,0,1]);
  acorn = ps.loadFile("acorn1.asc");
}
