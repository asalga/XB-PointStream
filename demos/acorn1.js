document.addEventListener('DOMContentLoaded', xbinit, false);
var t= 0;

function xbinit(){
var ps = new PointStream();

cvs = document.getElementById('canvas');

ps.setup(cvs);
ps.background([.0,0,0, 0.5]);
ps.openFile("acorn1.asc");

setTimeout(f, 800);

function f(){
 // ps.clear();
  //ps.render();

 //ps.background([1,0,0,1 ]);
   ps.clear();
  // ps.clear();
   ps.render();
   
  setInterval(f2,1000);
}

function f2(){
//  ps.clear();
//  ps.render();
}

}