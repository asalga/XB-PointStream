function start(cvs){
  var ps, pointCloud;
  ps = new PointStream(); 
  ps.setup(cvs);
  ps.onRender = function(){
    ps.clear();
    ps.uniformi("reflection", false);
    ps.uniformf("lightPos", [0, 50, 10]);
    ps.uniformf("uReflection", [1, 1, 1, 1]);
    ps.translate(0, 0, -70);
    ps.render(pointCloud);
    if(pointCloud.status === 3){
      ps.onRender = function(){};
    }
  };
  var progObj = ps.createProgram(vertShader, fragShader);
  ps.useProgram(progObj);
  ps.pointSize(10);
  pointCloud = ps.load("../../clouds/mickey.asc");
}
