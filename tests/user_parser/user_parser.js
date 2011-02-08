var ps, acorn;
var i = 0.0;
var j = 5.0;

function render() {
  ps.translate(0, 0, -20);
  ps.rotateY(i += 0.0011);
  ps.rotateZ(j += 0.0015);
  
  var c = acorn.getCenter();
  ps.translate(-c[0], -c[1], -c[2]);
  
  ps.clear();
  ps.render(acorn);
}
  
function start(){
  ps = new PointStream(); 
  ps.setup(document.getElementById('canvas'));
  ps.registerParser("asc", User_ASC_Parser);
  ps.onRender = render;
    
  ps.background([1, 1, 1, 1]);
  ps.pointSize(5);

  acorn = ps.load("../../clouds/acorn.asc");
}
