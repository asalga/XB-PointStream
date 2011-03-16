var ps, pointCloud;
var i = 0;

function render() {
  ps.translate(0, 0, -20);
  
  var c = pointCloud.getCenter();
  ps.rotateX(-Math.PI/2);
  ps.rotateZ(i-=0.005);
  ps.translate(-53.28,-75.85,-1.89);

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
  pointCloud = ps.load("../../clouds/lobby.pts");
}
