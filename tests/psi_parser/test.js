var ps, mickey;
var yRot = 0.0;
var zoomed = -50;
const KEY_ESC = 27;

function zoom(amt){
  zoomed += amt * 2 * 1;
}

function keyDown(){
  if(ps.key == KEY_ESC){
    ps.stop("../../clouds/lion.asc");
  }
}

function render() {
  ps.translate(0, 0, zoomed);
  ps.rotateY(yRot += 0.0011);
  
  var c = mickey.getCenter();
  ps.translate(-c[0], -c[1], -c[2]);
  
  ps.clear();
  ps.render(mickey);
}
  
function start(){
  ps = new PointStream(); 
  ps.setup(document.getElementById('canvas'));

  ps.onRender = render;
  
  ps.onMouseScroll = zoom;
  ps.onKeyDown = keyDown;
    
	ps.background([0.25, 0.25, 0.25, 1]);
  ps.pointSize(5);

  mickey = ps.load("../../clouds/Mickey_Mouse.psi");
}
