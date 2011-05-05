var canvasCounter = 1;

var pointCloud;
var ps;

var zoom = -65;
var left = 4;
var top = 5;

const POINT_CLOUD_PATH = "../../clouds/vibex_972K_n.psi";

const MAX_CANVASES = 5;

function render(){
  var c = pointCloud.getCenter();
  ps.clear();
    
  if(canvasCounter <= 2 ){
    ps.rotateZ(Math.PI/2);
    ps.translate(-c[0], -c[1], -c[2]);
    ps.translate(left, top, zoom);
    ps.render(pointCloud);
  }

  if(canvasCounter === 3){
    ps.rotateZ(Math.PI/2);
    ps.translate(-c[0], -c[1], -c[2]);
    ps.translate(left, top, zoom);

    ps.uniformi("uOutline", true);
    ps.render(pointCloud);
  
    ps.uniformi("uOutline", false);
    ps.render(pointCloud);
  }
    
  if(canvasCounter === 4 ){
    var ctx = ps.getContext();
    ctx.enable(ctx.BLEND);
    ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA);

    ps.uniformi("reflection", true);
    ps.uniformf("lightPos", [0, 50, 0]);
    ps.uniformf("uReflection", [.15, .15, .3, .8]);
    ps.uniformf("mirrorPos", [0, 100, 0]);
    
   // ps.uniformf("uReflection", [1, 1, 1, 1]);
   
    ps.pushMatrix();
      ps.rotateZ(Math.PI/2);
      ps.translate(-c[0], -c[1], -c[2]);
      ps.translate(left - 0, top, zoom);
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
  
  if(canvasCounter === 5){
    ps.background([0,0,0,1]);
    ps.clear();
    
    var ctx = ps.getContext();
    ctx.enable(ctx.BLEND);
    ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA);
    
    ps.rotateZ(Math.PI/2);
    ps.translate(-c[0], -c[1], -c[2]);
    ps.translate(0, left, zoom);

    ps.render(pointCloud);
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
      pointCloud = ps.load(POINT_CLOUD_PATH);
      var progObj = ps.createProgram(fixedFunctionVert, fixedFunctionFrag);
      ps.useProgram(progObj);
      break;
    
    case 3:
      pointCloud = ps.load(POINT_CLOUD_PATH);
      var progObj = ps.createProgram(cartoonVert, cartoonFrag);
      ps.useProgram(progObj);
      break;
      
    case 4:
      pointCloud = ps.load(POINT_CLOUD_PATH);
      var progObj = ps.createProgram(reflectionVert, reflectionFrag);
     // var progObj = ps.createProgram(cartoonVert, cartoonFrag);
      ps.useProgram(progObj);
      break;
    
    case 5:
      pointCloud = ps.load(POINT_CLOUD_PATH);
      var progObj = ps.createProgram(xrayVertShader, xrayFragShader);
      ps.useProgram(progObj);
      break;
      
    default:break;
  }

  ps.pointSize(5);
  ps.onRender = render;
}
