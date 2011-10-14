function start(cvs, cb){
  var ps = new PointStream();
  ps.setup(cvs);
  ps.pointSize(5);
  
  var vert = ps.getShaderStr("../../shaders/fixed_function.vs");
  var frag = ps.getShaderStr("../../shaders/fixed_function.fs");
  
  var fixedFunctionProg = ps.createProgram(vert, frag);
  ps.useProgram(fixedFunctionProg);
  
  var lightName = "lights0";
  ps.uniformi("lights0.isOn", true);
  ps.uniformf("lights0.position", [0,0,1]);
  ps.uniformf("lights0.diffuse", [1,1,1]);
  ps.uniformi("lights0" + ".type", 1);
  
  ps.onRender = function(){
    if(cloud.status === 3){
      ps.background([1, 1, 1, 1]);
      ps.clear();
      var c = cloud.getCenter();
      ps.translate(-c[0], -c[1], -c[2]);
      ps.translate(0, 0, -18);
      ps.render(cloud);
      cb();
      ps.onRender = function(){};
    }
  };
  var cloud = ps.load('../../clouds/acorn_verts_norms.asc');
}