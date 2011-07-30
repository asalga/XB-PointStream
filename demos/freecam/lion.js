var mouseDown = false;
var ps, pointCloud, cam;

function mousePressed(){
  mouseDown = true;  
}

function mouseReleased(){
  mouseDown = false;
}

function render() {
  var y = -(ps.mouseX - ps.width/2) / ps.width/50;
  cam.yaw(y);
  
  if(mouseDown){
    cam.pos = V3.add(cam.pos, V3.scale(cam.dir, 0.05));
  }
  
  var h = -(ps.mouseY - ps.height/2) / ps.height/10;
  cam.pos = V3.add(cam.pos, [0,h,0]);
  
  ps.loadMatrix(M4x4.makeLookAt(cam.pos, V3.add(cam.dir, cam.pos), cam.up));
  
  var c = pointCloud.getCenter();
  ps.translate(-c[0], -c[1], -c[2]);

  ps.clear();
  ps.render(pointCloud);
}

function start(){
  cam = new FreeCam();
  ps = new PointStream();
  ps.setup(document.getElementById('canvas'));
  ps.background([0.2, 0.2 ,0.2 ,1]);
  ps.pointSize(5);
  ps.resize(window.innerWidth, window.innerHeight);
  ps.onRender = render;
  ps.onMousePressed = mousePressed;
  ps.onMouseReleased = mouseReleased;
  
  pointCloud = ps.load("../../clouds/eggenburg.asc");
}
