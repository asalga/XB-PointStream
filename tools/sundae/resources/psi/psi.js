function start(cvs, cb){
  var ps = new PointStream();
  ps.setup(cvs);
  ps.pointSize(5);
  ps.onRender = function(){
    if(pointCloud.status === 3){
      ps.background([0.3, 0.6, 0.9, 1]);
      ps.clear();
      ps.translate(0, 0, -70);
      ps.render(pointCloud);
      cb();
      ps.onRender = function(){};
    }
  };
  var pointCloud = ps.load('../../clouds/Mickey_Mouse.psi');
}