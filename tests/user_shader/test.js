var ps, mickey;
var rotY = 0.0;
var rotX = 0.3;

var progObj;
var fps_label;

function render() {
  ps.clear();
  
  // spin object
  rotY += 0.01;

  // Draw reflection
  ps.uniformi("reflection", true);
  ps.uniformf("lightPos", [0, -50, 10]);
  ps.uniformf("uReflection", [.15, .15, .3, .8]);
  ps.pushMatrix();
    ps.translate(0, 10, -80);
    ps.rotateX(rotX);  
    ps.translate(0, -55, 0);  
    ps.scale(1, -1, 1);
    ps.rotateY(rotY);
    ps.render(mickey);
  ps.popMatrix();
  
  // Draw object
  ps.uniformi("reflection", false);
  ps.uniformf("lightPos", [0, 50, 10]);
  ps.uniformf("uReflection", [1, 1, 1, 1]);
  ps.pushMatrix();
    ps.translate(0, 10, -80);
    ps.rotateX(rotX);
    ps.rotateY(rotY);
    ps.render(mickey);
  ps.popMatrix();
  
  fps_label.innerHTML = Math.floor(ps.frameRate) + " FPS";
}

function start(){
  fps_label = document.getElementById("fps");
  
  ps = new PointStream(); 
  ps.setup(document.getElementById('canvas'));

  var vert = ps.getShaderStr("../../shaders/reflection.vs");
  var frag = ps.getShaderStr("../../shaders/reflection.fs");
  
  progObj = ps.createProgram(vert, frag);
  ps.useProgram(progObj);
  
  ps.pointSize(10);
  ps.onRender = render;
  ps.background([1, 1, 1, 1]);
  mickey = ps.load("../../clouds/mickey.asc");
}
