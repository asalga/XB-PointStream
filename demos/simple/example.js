function start(){
  var ps = new PointStream();
  ps.setup(document.getElementById('canvas'));
  var acorn = ps.load("../../clouds/acorn.asc");  
  ps.pointSize(5);
  ps.onRender = function(){
    ps.translate(0, 0, -25);
    ps.clear();
    ps.render(acorn);
  };
}
