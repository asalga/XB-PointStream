var ps, acorn;

function render() {
  var c = acorn.getCenter();
  ps.translate(-c[0], -c[1], -20-c[2]);
  
  ps.clear();
  ps.render(acorn);
  
  if(acorn.getStatus() === 3){
    ps.onRender = function(){};
  }
}

function start(){
  ps = new PointStream();
  ps.setup(document.getElementById('canvas'));
  ps.onRender = render;
  
  ps.background([0, 0, 0, 0.5]);
  ps.pointSize(5);
  
  acorn = ps.load("../../clouds/acorn_verts_norms.asc");
}
