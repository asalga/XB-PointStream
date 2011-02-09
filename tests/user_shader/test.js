var ps, acorn, progObj;
var i = 0.0;

function render() {
  ps.translate(0, 0, -20);
  ps.rotateY(i += 0.0011);
  
  ps.clear();
  ps.render(acorn);
  
  var fps = Math.floor(ps.frameRate);
  var fps_label = document.getElementById("fps");
  fps_label.innerHTML = fps + " FPS";
}
 
function start(){
  ps = new PointStream(); 
  ps.setup(document.getElementById('canvas'));
  ps.onRender = render;
  ps.background([0,0,0,1]);
  
  progObj = ps.createProgram(scan_vertShader, scan_fragShader);
  ps.useProgram(progObj);
  ps.pointSize(3);

  acorn = ps.load("../../clouds/acorn.asc");
}
