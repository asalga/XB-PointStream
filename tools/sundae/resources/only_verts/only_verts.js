function start(cvs, cb){
  var ps = new PointStream();
  ps.setup(cvs);
  ps.pointSize(5);
  ps.onRender = function(){
    if(pointCloud.status === 3){
      ps.background([1, 1, 1, 1]);
      ps.clear();
      ps.translate(0, 0, -25);
      ps.render(pointCloud);
      cb();
      ps.onRender = function(){};
    }
  };
  var pointCloud = ps.load('../../clouds/acorn_only_verts.asc');
}