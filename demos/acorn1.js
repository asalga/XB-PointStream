document.addEventListener('DOMContentLoaded', start, false);

var t = 0;
var ps;
var acorn;
var r = 0;

function render(){
  ps.rotateY(Math.PI*2);
  ps.clear();
  ps.render();
//  window.status = Math.floor(ps.frameRate);
}

function start(){
  ps = new PointStream();
  ps.setup(document.getElementById('canvas'), render);
  ps.background([0,0,0,1]);
  acorn = ps.loadFile("acorn1.asc");
}
