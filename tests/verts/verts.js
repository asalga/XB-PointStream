var onlyVerts = null;
var ps = null;

function render() {
  ps.translate(0, 0, -20);
  
  var c = onlyVerts.getCenter();
  ps.translate(-c[0], -c[1], -c[2]);
  
  ps.clear();
  ps.render(onlyVerts);
}
  
function start(){
  ps = new PointStream(); 
  ps.setup(document.getElementById('canvas'));
  ps.background([0, 0, 0, 0.5]);
  ps.pointSize(5);
  ps.onRender = render;
  onlyVerts = ps.load("../../clouds/acorn_only_verts.asc");
}
