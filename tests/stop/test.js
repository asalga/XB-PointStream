var ps, cloud;
var r = 0.0;

function switchCloud(i){
  switch(i){
    case 1: ps.stop("../../clouds/mickey.asc");
            cloud = ps.load("../../clouds/eggenburg.asc");
            document.getElementById('mickey').checked = false;
            break;
    
    case 2: ps.stop("../../clouds/eggenburg.asc");
            cloud = ps.load("../../clouds/mickey.asc");
            document.getElementById('eggenburg').checked = false;
            break;
  }
}

function render() {
  if(cloud){
    ps.translate(0, 0, -90);
    ps.rotateY(r+=0.01);
    var c = cloud.getCenter();
    ps.translate(-c[0], -c[1], -c[2]);
    
    ps.clear();
    ps.render(cloud);
  }
}

function start(){
  ps = new PointStream();
  ps.setup(document.getElementById('canvas'));
  ps.background([0, 0, 0, 0.5]);
  ps.pointSize(5);
  ps.onRender = render;
}
