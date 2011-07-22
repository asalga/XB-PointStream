function start(){
  var ps = new PointStream();
  ps.setup(document.getElementById("canvas"));
  var pointCloud = ps.load("../../clouds/mask_70K.psi");
  
  ps.pointSize(8);
  ps.onRender = function(){
    var c = pointCloud.getCenter();
    ps.translate(-c[0], -c[1], -c[2]);
    ps.translate(0, 0, -55);
    ps.clear();
    ps.render(pointCloud);
  };
}