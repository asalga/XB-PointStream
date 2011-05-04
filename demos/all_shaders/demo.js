var canvasCounter = 1;
var pointCloud;
var ps;

const POINT_CLOUD_PATH = "../../clouds/vibex.psi";

function render(){

  ps.clear();
  if(canvasCounter !== 4){
    var c = pointCloud.getCenter();
    ps.translate(-c[0], -c[1], -c[2]);
    ps.translate(3, 0, -68);
    ps.render(pointCloud);
  }

  if(canvasCounter === 4){
    ps.uniformi("reflection", true);
    ps.uniformf("lightPos", [0, -50, 50]);
    ps.uniformf("uReflection", [.15, .15, .3, .8]);
    ps.pushMatrix();
      ps.translate(0, -10, -30);
      ps.rotateX(0);  
      ps.translate(0, -0, 0);  
      ps.scale(1, -1, 1);
      ps.rotateY(0);
      ps.render(pointCloud);
    ps.popMatrix();
    
    // Draw object
    ps.uniformi("reflection", false);
    ps.uniformf("lightPos", [0, 50, 50]);
    ps.uniformf("uReflection", [1, 1, 1, 1]);
    ps.pushMatrix();
      ps.translate(0, -0, -30);
      ps.rotateX(0);
      ps.rotateY(0);
      ps.render(pointCloud);
    ps.popMatrix();
  }
  
  
  if(pointCloud.status === 3){
    canvasCounter++;
    start(canvasCounter);
  }
};

function start(cvs){
  ps = new PointStream();
  ps.setup(document.getElementById(cvs));
  pointCloud = ps.load(POINT_CLOUD_PATH);

  switch(cvs){
    // just colors
    case 1:
      break;
    
    case 2:
      ps.stop(POINT_CLOUD_PATH);
      pointCloud = ps.load(POINT_CLOUD_PATH);
      var progObj = ps.createProgram(fixedFunctionVert, fixedFunctionFrag);
      ps.useProgram(progObj);
      break;
    
    case 3:
      ps.stop(POINT_CLOUD_PATH);
      pointCloud = ps.load(POINT_CLOUD_PATH);
      var progObj = ps.createProgram(cartoonVert, cartoonFrag);
      ps.useProgram(progObj);
      break;
      
    case 4:
      ps.stop(POINT_CLOUD_PATH);
      pointCloud = ps.load(POINT_CLOUD_PATH);
      var progObj = ps.createProgram(reflectionVert, reflectionFrag);
      ps.useProgram(progObj);
      break;
    
   // case 5:
    //  var progObj = ps.createProgram(reflectionVert, reflectionFrag);
     // ps.useProgram(progObj);
     // break;    
    
  }

  ps.pointSize(5);
  ps.onRender = render;
}
