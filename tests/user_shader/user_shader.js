var mickey = null;
var ps = null;
var i = 0.0;

var reflectionShader;
var objectShader;
var toggle = false;

function keyDown(){
}

function render() {
  ps.clear();
  
  var center = [-1.1931838002830566,0.2915859633078008,-0.6363419673371361];
  
  i += 0.05;

  // Draw reflection
  ps.uniformf(objectShader, "test", [0, -50, 10]);
  ps.uniformf(objectShader, "blah", [.15, .15, .3, .8]);
  
  ps.pushMatrix();
  ps.translate(0, 20, -80);
  ps.rotateX(1.0);  
  ps.translate(0, -55, 0);  
  ps.scale(1, -1, 1);
  ps.rotateY(i);
  ps.render(mickey);
  ps.popMatrix();

  ps.uniformf(objectShader, "test", [0, 50, 10]);
  ps.uniformf(objectShader, "blah", [1,1,1,1]);  
  ps.pushMatrix();
  ps.translate(0, 20, -80);
  ps.rotateX(1.0);
  ps.rotateY(i);
  ps.render(mickey);
  ps.popMatrix();
  
  var fps = Math.floor(ps.frameRate);
  var fps_label = document.getElementById("fps");
  fps_label.innerHTML = fps + " FPS";
}

function start(){
  ps = new PointStream(); 
  ps.setup(document.getElementById('canvas'));
  objectShader = ps.createProgram(vertShader, fragShader);
  ps.useProgram(objectShader);
  ps.pointSize(10);

  ps.onRender = render;
  ps.onKeyDown = keyDown;
  
  ps.background([0, 0, 0, 0.7]);
  
  mickey = ps.load("../../clouds/mickey.asc");
}
