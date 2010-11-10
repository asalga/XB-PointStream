var acorn;
var ps;

function render() {
  ps.translate(0, 0, -20);
  
  var c = acorn.getCenter();
  ps.translate(-c[0],-c[1],-c[2]);
  
  // redraw
  ps.clear();
  ps.render();
}

function start(){
  ps = new PointStream();
  ps.setup(document.getElementById('canvas'), render);
  
  ps.background([0, 0, 0, 0.5]);
  ps.pointSize(5);
  
  acorn = ps.loadFile({path:"acorn_vn.asc"});
}
