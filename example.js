var ps, acorn;

function start(){
  ps = new PointStream();
  ps.setup(document.getElementById('canvas'));
  ps.pointSize(5);
  ps.onRender = function(){
    ps.translate(0, 0, -25);
    ps.render(acorn);
  };
  acorn = ps.load("clouds/acorn_center.asc");
}
