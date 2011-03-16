var ps, lion;

var buttonDown = false;
var zoomed = -50;
var rot =[0, 0];
var curCoords = [0, 0];

const KEY_ESC = 27;

function zoom(amt){
  var invert = document.getElementById('invertScroll').checked ? -1: 1;
  zoomed += amt * 2 * invert;
}

function mousePressed(){
  curCoords[0] = ps.mouseX;
  curCoords[1] = ps.mouseY;
  buttonDown = true;
}

function mouseReleased(){
  buttonDown = false;
}

function keyDown(){
  if(ps.key == KEY_ESC){
    ps.stop("../../clouds/lion.asc");
  }
}

function render() {
  var deltaX = ps.mouseX - curCoords[0];
  var deltaY = ps.mouseY - curCoords[1];
  
  if(buttonDown){
    rot[0] += deltaX / 250;
    rot[1] += deltaY / 250;
    curCoords[0] = ps.mouseX;
    curCoords[1] = ps.mouseY;
  }

  // transform point cloud
  ps.translate(0, 0, zoomed);

  ps.rotateY(rot[0]);
  ps.rotateX(rot[1]);
 
  // !! fix 
  ps.translate(281.32617943646534,205.61656736098982,290.55082983174293);  
  ps.clear();
  ps.render(lion);
  
  var status = document.getElementById('fileStatus');
  status.innerHTML = "";
  switch(lion.status){
    case 1: status.innerHTML = "status: STARTED";break;
    case 2: status.innerHTML = "status: STREAMING";break;
    case 3: status.innerHTML = "status: COMPLETE";break;
    default:break;
  }
  
  var fps = Math.floor(ps.frameRate);
  if(fps < 1){
    fps = "< 1";
  }
  
  status.innerHTML  += "<br />" 
                    + addCommas(new String(lion.getNumPoints()))
                    + " points @ " + fps + " FPS";
}

/*
  @param {Number} value Number to convert
  @returns {String} Number separated with commas
*/
function addCommas(value){
  var withCommas = "";
  var valueStr = "" + value;
  
  var counter = valueStr.length-1;
  var i = 1;
  for(;counter >= 0; counter--, i++){
    withCommas += value[counter];

    if(i % 3 === 0 && counter > 0){
      withCommas += ",";
    }
  }

  var correctOrder = "";
  for(i = 0; i < withCommas.length; i++){
    correctOrder += withCommas[withCommas.length-1-i];
  }

  return correctOrder;
}

function start(){
  ps = new PointStream();
  ps.setup(document.getElementById('canvas'));
  ps.background([0.2, 0.2 ,0.2 ,1]);
  ps.pointSize(8);

  ps.onRender = render;
  ps.onMouseScroll = zoom;
  ps.onMousePressed = mousePressed;
  ps.onMouseReleased = mouseReleased;
  ps.onKeyDown = keyDown;
  
  lion = ps.load("../../clouds/lion.asc");
}
