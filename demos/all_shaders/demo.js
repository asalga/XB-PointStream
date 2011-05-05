var canvasCounter = 1;

var pointCloud;
var ps;

const POINT_CLOUD_PATH = "../../clouds/vibex.psi";
const MAX_CANVASES = 4;

function render(){
  var c = pointCloud.getCenter();
  ps.clear();
    
  if(canvasCounter <= 2 ){
    ps.rotateZ(Math.PI/2);
    ps.translate(-c[0], -c[1], -c[2]);
    ps.translate(3, 0, -58);
    ps.render(pointCloud);
  }


  if(canvasCounter === 3){
    ps.rotateZ(Math.PI/2);
    ps.translate(-c[0], -c[1], -c[2]);
    ps.translate(3, 0, -58);

    ps.uniformi("uOutline", true);
    ps.render(pointCloud);
  
    ps.uniformi("uOutline", false);
    ps.render(pointCloud);
  }

  if(canvasCounter === 4 ){
    ps.uniformi("reflection", true);
    ps.uniformf("lightPos", [0, -50, 50]);
    ps.uniformf("uReflection", [.15, .15, .3, .8]);
    ps.uniformf("mirrorPos", [.15, .15, .3, .8]);
    
   // ps.uniformf("uReflection", [1, 1, 1, 1]);
   
    ps.pushMatrix();
      ps.translate(-c[0], -c[1], -c[2]);
      ps.translate(3, 0, -58);
      ps.render(pointCloud);
    ps.popMatrix();
    
    /*
    ps.pushMatrix();
      ps.translate(-c[0], -c[1], -c[2]);
        
      ps.translate(0, -10, -60);
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
    ps.popMatrix();*/
  }
  
  if(pointCloud.status === 3 && canvasCounter < MAX_CANVASES){
    canvasCounter++;
    start(canvasCounter);
  }
};

function start(cvs){
  canvasCounter = parseInt(cvs);

  ps = new PointStream();
  ps.setup(document.getElementById(cvs));

  switch(cvs){
    // just colors
    case 1:
      pointCloud = ps.load(POINT_CLOUD_PATH);
      break;
    
    case 2:
    //  ps.stop(POINT_CLOUD_PATH);
      pointCloud = ps.load(POINT_CLOUD_PATH);
      var progObj = ps.createProgram(fixedFunctionVert, fixedFunctionFrag);
      ps.useProgram(progObj);
      break;
    
    case 3:
    //  ps.stop(POINT_CLOUD_PATH);
      pointCloud = ps.load(POINT_CLOUD_PATH);
      var progObj = ps.createProgram(cartoonVert, cartoonFrag);
      ps.useProgram(progObj);
      break;
      
    case 4:
    //  ps.stop(POINT_CLOUD_PATH);
      pointCloud = ps.load(POINT_CLOUD_PATH);
      var progObj = ps.createProgram(reflectionVert, reflectionFrag);
     // var progObj = ps.createProgram(cartoonVert, cartoonFrag);
      ps.useProgram(progObj);
      break;
    
   // case 5:
    //  var progObj = ps.createProgram(reflectionVert, reflectionFrag);
     // ps.useProgram(progObj);
     // break;    
    default:break;
  }

  ps.pointSize(5);
  ps.onRender = render;
}
