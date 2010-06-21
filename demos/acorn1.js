document.addEventListener('DOMContentLoaded', xbinit, false);

var t = 0;

function xbinit(){
  var ps = new PointStream();

  cvs = document.getElementById('canvas');

  ps.setup(cvs);
  ps.background([0,0,0, 1]);
  ps.openFile("acorn1.asc");

  setInterval(draw, 1000);

  function draw(){
    ps.background([0,0.5,Math.abs(Math.sin(t+=0.01)), 0.5]);
    ps.clear();
    ps.render();
  }
}