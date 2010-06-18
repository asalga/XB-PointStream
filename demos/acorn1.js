document.addEventListener('DOMContentLoaded', xbinit, false);


function xbinit(){
var ps = new PointStream();

cvs = document.getElementById('canvas');

ps.setup(cvs);
ps.background([.33,.66,.99]);
ps.openFile("acorn1.asc");

setTimeout(f, 800);

function f(){
  //ps.background([.33,.66,.99]);
  ps.clear();
  ps.render();
}
}