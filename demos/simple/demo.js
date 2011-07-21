function start(){
  var ps = new PointStream();
  ps.setup(document.getElementById("canvas"));
  
  var acorn = ps.load("../../clouds/acorn.psi");
  
  ps.pointSize(5);
  ps.onRender = function(){
    var c = acorn.getCenter();
    ps.translate(-c[0], -c[1], -c[2]);
    ps.translate(0, 0, -25);
    ps.clear();
    ps.render(acorn);
  };
}
