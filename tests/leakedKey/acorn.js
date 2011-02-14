var ps, acorn;

function start(){
  ps = new PointStream();
  ps.setup(document.getElementById('canvas'));
  ps.pointSize(5);
  ps.onKeyDown = function(){
    ps.println(window.key);
  };
  ps.onRender = function(){
    ps.translate(0, 0, -25);
    ps.clear();
    ps.render(acorn);
  };
  acorn = ps.load("../../clouds/acorn.asc");
}
