var ps, mickey;
var i = 0.0;
var j = 5.0;
var zoomed = -20;

function zoom(amt){
  zoomed += amt * 2 * 1;
}

function render() {
  ps.translate(0, 0, zoomed);
  ps.rotateY(i += 0.0011);
  ps.rotateZ(j += 0.0015);
  
  var c = mickey.getCenter();
  ps.translate(-c[0], -c[1], -c[2]);
  
  ps.clear();
  ps.render(mickey);
}
  
function start(){
  ps = new PointStream(); 
  ps.setup(document.getElementById('canvas'));
  ps.registerParser("psi", PSI_Parser);
  ps.onRender = render;
  ps.onMouseScroll = zoom;
	ps.background([1, 1, 1, 1]);
  ps.pointSize(5);

  mickey = ps.load("../../clouds/Mickey_Mouse.psi");
}
