var acorn = null;
var ps = null;

function render() {
  ps.translate(0, 0, -20);
  
  var c = acorn.getCenter();
  ps.translate(-c[0], -c[1], -c[2]);
  
  ps.clear();
  ps.render(acorn);
}
  
function start(){
  ps = new PointStream(); 
  ps.setup(document.getElementById('canvas'));
  ps.onRender = render;
  
  ps.background([0, 0, 0, 0.5]);
  ps.pointSize(5);
  
  ps.registerParser("asc", User_ASC_Parser);

  acorn = ps.load("../../clouds/acorn.asc");
}
