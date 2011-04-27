function start(cvs, cb){
  var ps = new PointStream();
  ps.setup(cvs);
  ps.pointSize(1);
  ps.onRender = function(){
    if(pointCloud.status === 3){
      ps.background([0.5, 0.3, 0.9, 1]);
      ps.clear();
      
      var c = pointCloud.getCenter();
      
      ps.translate(-c[0], -c[1], -c[2]-65);
      ps.render(pointCloud);
      cb();
      ps.onRender = function(){};
    }
  };
  var pointCloud = ps.load('../../clouds/mickey_754K_n.psi');
}