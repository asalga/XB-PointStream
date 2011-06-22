var ps, mickey;

// If these values aren't set and the device used does
// not support MozOrientation, nothing will render.
var x = 0;
var y = 0;

function render() {
  ps.translate(0, 0, -50);

  // When the user tilts the device down, the point cloud
  // should rotate about X in the opposite direction
  // which gives the illusion the point cloud is behind the device  
  var invertX = document.getElementById('invert').checked ? -1 : 1;
  ps.rotateX(x * invertX * 2.5);
  ps.rotateY(y * 2.5);
  
  ps.clear();
  ps.render(mickey);
}

function handleOrientation(data){
  // swap the values to make the orientation make sense.
  // if the device is pitched forward or backward, (moz y)
  // convert to a rotation about x.
  
  // if the device is rolled left or right, (moz x)
  // convert to a rotation about y
  x = data.y;
  y = data.x;
}

function start(){
  ps = new PointStream();
  ps.setup(document.getElementById('canvas'));
  ps.background([0.3, 0.5, 0.6, 0.6]);


  var vert = ps.getShaderStr("../../shaders/fixed_function.vs");
  var frag = ps.getShaderStr("../../shaders/fixed_function.fs");
  var progObj = ps.createProgram(vert, frag);
  ps.useProgram(progObj);
  ps.pointSize(10);
  
  ps.uniformi("lights0.isOn", true);
  ps.uniformf("lights0.position", [-90, 50, 100]);
  ps.uniformf("lights0.diffuse", [1,1,1]);

  addEventListener("MozOrientation", handleOrientation, true);
  ps.onRender = render;
  
  mickey = ps.load("../../clouds/mickey.asc");
}
