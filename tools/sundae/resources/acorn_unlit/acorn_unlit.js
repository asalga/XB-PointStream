function start(cvs, cb){
  var ps = new PointStream();
  ps.setup(cvs);
  ps.pointSize(5);
  ps.onRender = function(){
    if(acorn.status === 3){
      ps.background([1, 1, 1, 1]);
      ps.clear();
      ps.translate(0, 0, -25);
      ps.render(acorn);
      cb();
      ps.onRender = function(){};
    }
  };
  var acorn = ps.load('../../clouds/acorn.asc');
}