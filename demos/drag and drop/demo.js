var currentCloudPath;
var ps, pointCloud;

var buttonDown = false;
var zoomed = -50;
var rot = [0, 0];
var curCoords = [0, 0];

function zoom(amt){
  zoomed += amt * 2;
}

function resetBackgroundColor(){
  getTag("canvas").style.background = "url(cloud.png)";
  getTag("canvas").style.backgroundRepeat = "no-repeat";
  getTag("canvas").style.backgroundPosition = "150 100";
  
  // If we're rendering something, set it back to the default color
  if(ps){
    ps.background([0.5, 0.7, 1, 1]);
  }
}

function mousePressed(){
  curCoords[0] = ps.mouseX;
  curCoords[1] = ps.mouseY;
  buttonDown = true;
}

function mouseReleased(){
  buttonDown = false;
}

/*
  RENDER
*/
function render(){
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

  var c = pointCloud.getCenter();
  
  ps.translate(-c[0], -c[1], -c[2]);

  ps.clear();
  ps.render(pointCloud);
}

/*
  To prevent RSI
*/
function getTag(str){
  return document.getElementById(str);
}

/*
  DROPPED
*/
function dropped(event) {
  event.stopPropagation();
  event.preventDefault();

  netscape.security.PrivilegeManager.enablePrivilege("UniversalFileRead");

  // event.dataTransfer.files does not exist if the user
  // grabs an element from the DOM and drops it
  if(event.dataTransfer.files[0]){
    var filePath = event.dataTransfer.files[0].mozFullPath;
    var ext = filePath.split(".").pop().toLowerCase();
    console.log(ext);
   
    // only accept point cloud files
    if(ext === "asc" || ext === "pts" || ext === "psi"){

      // Make the canvas appear to be 'used'
      var cvsTag = getTag("canvas");
      cvsTag.style.border = "5px solid black";

      // If we were parsing something before
      // stop it so we can focus on the new
      // point cloud
      if(currentCloudPath){
        ps.stop(currentCloudPath);
        ps.clear();
        ps.onRender = function(){};
      }
      currentCloudPath = filePath;
       
      ps = new PointStream();

      ps.setup(getTag('canvas'));

      var progObj = ps.createProgram(fixedFunctionVert, fixedFunctionFrag);
      ps.useProgram(progObj);
      ps.pointSize(5);
  
      resetBackgroundColor();
      ps.pointSize(5);
      ps.onRender = render;
      
      zoomed = -50;
      rot = [0, 0];
      curCoords = [0, 0];
      
      ps.onMouseScroll = zoom;
      ps.onMousePressed = mousePressed;
      ps.onMouseReleased = mouseReleased;
    
      pointCloud = ps.load(filePath);
    }
    else{
      console.log('file not supported');      
    }
  }
  resetBackgroundColor();
}

/*
  DRAG ENTER
  //#F8BB70 orange
*/
function dragenter(event){
  // hacky way of checking if we're dragging in a image or file  
  // This is null if the user is trying to drag in a file.
  // So, use a green color which means good!
  if(event.dataTransfer.mozSourceNode === null){
    if(ps){
      ps.background([0.33, 1, 0.33, 1]);
    }
    else{
      getTag("canvas").style.backgroundColor = "#55FF55";
    }
  }
  else{
    if(ps){
      ps.background([1, 0.33, 0.33, 1]);
    }
    else{
      getTag("canvas").style.backgroundColor = "#FF5555";
    }
  }
}

/*
  DRAG LEAVE
*/
function dragleave(event){
  resetBackgroundColor();
}

/*
  IGNORE
*/
function ignore(event){
  event.preventDefault();
}

function addListeners(){
  // If the user accidentally drop the point cloud
  // file somewhere else in the window, prevent
  // the browser from openeing up the file, that's unnecessary.
  document.addEventListener("dragover", ignore, false);
  document.addEventListener("drop", ignore, false);

  var cvs = getTag('canvas');
  cvs.addEventListener('dragover', ignore, false);
  cvs.addEventListener('dragenter', dragenter, false);
  cvs.addEventListener('dragleave', dragleave, false);
  cvs.addEventListener('drop', dropped, false);
}