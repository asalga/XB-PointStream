var acorn = null;
var ps = null;

function render(){
  ps.translate(0, 0, -30);
  ps.clear();
  ps.render(acorn);
}

function start(){
  ps = new PointStream();
  ps.setup(document.getElementById('canvas'));
  ps.pointSize(4);
  ps.onRender = render;
  acorn = ps.load("acorn.asc");
}
