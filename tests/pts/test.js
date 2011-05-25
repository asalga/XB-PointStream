var ps, pointCloud;
var yRot = 0;
const KEY_ESC = 27;

function keyDown(){
  if(ps.key === KEY_ESC){
    ps.stop("../../clouds/lobby.pts");
  }
}

function render() {
  ps.translate(0, 0, -20);
  
  var c = pointCloud.getCenter();
  ps.rotateX(-Math.PI/2);
  ps.rotateZ(yRot -= 0.005);

  var c = pointCloud.getCenter();
  ps.translate(-c[0], -c[1], -c[2]);

  ps.clear();
  ps.render(pointCloud);
  
  document.getElementById('debug').innerHTML = Math.floor(ps.frameRate);
}
  
function start(){
  ps = new PointStream(); 
  ps.setup(document.getElementById('canvas'));
  ps.background([0, 0, 0, 1.0]);
  ps.pointSize(3);
  
  ps.onRender = render;
  ps.onKeyDown = keyDown;
  
  pointCloud = ps.load("../../clouds/lobby_389K.pts");
}
