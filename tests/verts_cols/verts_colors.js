var ps, pointCloud;

function render() {
  var c = pointCloud.getCenter();
  ps.translate(-c[0], -c[1], -30-c[2]);
  
  ps.clear();
  ps.render(pointCloud);
  
  if(pointCloud.getStatus() === 3){
    ps.onRender = function(){};
  }
}

function start(){
  ps = new PointStream();  
  ps.setup(document.getElementById('canvas'));
  ps.onRender = render;
  
  ps.background([0, 0, 0, 0.5]);
  ps.pointSize(5);

  pointCloud = ps.load("../../clouds/mickey_verts_cols.asc");
}
