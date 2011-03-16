var ps, mickey;

// set these values in case the device used does not
// have MozOrientation. At least we can render the point cloud
var x = 0;
var z = 0;

function render() {
  ps.translate(0, 0, -50);
  ps.rotateX(x * 2.5);
  ps.rotateZ(z * 2.5);
  
  ps.clear();
  ps.render(mickey);
}

function handleOrientation(data){
  x = data.y;
  z = data.x;
}

function getShaderSrc(id) {
  var shaderSrc = document.getElementById(id);

  var str = "";
  var i = shaderSrc.firstChild;
  while (i) {
    if (i.nodeType == 3){
      str += i.textContent;
    }
    i = i.nextSibling;
  }
  return str;
}

function start(){
  ps = new PointStream();
  ps.setup(document.getElementById('canvas'));
  ps.background([0.3, 0.5, 0.6, 0.6]);

  ps.onRender = render;
  addEventListener("MozOrientation", handleOrientation, true);

  var progObj = ps.createProgram(getShaderSrc("shader-vs"), getShaderSrc("shader-fs"));
  ps.useProgram(progObj);
  ps.pointSize(10);
  
  ps.uniformf("lightPos", [0, 50, 10]);
  mickey = ps.load("../../clouds/mickey.asc");
}
