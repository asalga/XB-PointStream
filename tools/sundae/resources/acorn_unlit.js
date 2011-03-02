function start(cvs){
  var acorn;
  var ps = new PointStream();
  ps.setup(cvs);
  ps.pointSize(5);
  ps.onRender = function(){
    ps.background([1, 1, 1, 1]);
    ps.clear();
    ps.translate(0, 0, -25);
    ps.render(acorn);
    if(acorn.status === 3){
      ps.onRender = function(){};
    }
  };
  acorn = ps.load('../../clouds/acorn.asc');
}