var canvasCounter = 1;

var pointCloud;
var ps;

var progCartoon;
var progGooch;

var zoom = -65;
var left = 3;
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

   /* ps.useProgram(progCartoon);
    ps.rotateZ(Math.PI/2);
    ps.translate(-c[0], -c[1], -c[2]);
    ps.translate(left, top, zoom);
    ps.uniformi("uOutline", true);
    var ctx = ps.getContext();
    ctx.disable(ctx.DEPTH_TEST);
   // ps.render(pointCloud);*/
        
    ps.useProgram(progGooch);
    ps.rotateZ(Math.PI/2);
    ps.translate(-c[0], -c[1], -c[2]);
    ps.translate(left, top, zoom);

    ps.uniformf("warmColor", [0.5, 0.5, 0.0]);
    ps.uniformf("coolColor", [0, 0, 1]);
    ps.uniformf("surfaceColor", [0.1, 0.1, 0.1]);
      
    ps.render(pointCloud);
  }
  
  if(canvasCounter === 5){
    ps.clear();
    
    var ctx = ps.getContext();
    ctx.enable(ctx.BLEND);
    ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA);
    
    ps.rotateZ(Math.PI/2);
    ps.translate(-c[0], -c[1], -c[2]);
    ps.translate(left, top, zoom);

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
      prog = ps.createProgram(greyVert, greyFrag);
      ps.useProgram(prog);
      break;
      
    case 4:
      pointCloud = ps.load(POINT_CLOUD_PATH);

      progCartoon = ps.createProgram(cartoonVert, cartoonFrag);
      progGooch = ps.createProgram(gooch_vs, gooch_fs);
      ps.useProgram(progGooch);
      
      ps.uniformf("warmColor", [0.5, 0.5, 0.0]);
      ps.uniformf("coolColor", [0, 0, 1]);
      ps.uniformf("surfaceColor", [0.1, 0.1, 0.1]);
      break;
    
    case 5:
      pointCloud = ps.load(POINT_CLOUD_PATH);
      var progObj = ps.createProgram(xrayVertShader, xrayFragShader);
      ps.useProgram(progObj);
      break;
      
    default:break;
  }

  ps.pointSize(6);
  ps.onRender = render;
}
