function start(cvs){
  var ps = new PointStream();
  ps.setup(cvs);
  ps.pointSize(5);
  ps.onRender = function(){
    ps.background([0.3,0.6,0.9,1]);
    ps.clear();
    ps.translate(0, 0, -70);
    ps.render(acorn);
    if(acorn.status === 3){
      ps.onRender = function(){};
    }
  };
  var acorn = ps.load('../../clouds/Mickey_Mouse.psi');
}