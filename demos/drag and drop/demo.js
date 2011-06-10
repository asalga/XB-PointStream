var currentCloudPath;
var ps, pointCloud;

// Create an orbit camera halfway between the closest and farthest point
var cam = new OrbitCam({closest:10, farthest:400, distance: 100});
var isDragging = false;
var rotationStartCoords = [0, 0];

function zoom(amt){
  if(amt < 0){
    cam.goCloser(-amt);
  }
  else{
    cam.goFarther(amt);
  }  
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
  rotationStartCoords[0] = ps.mouseX;
  rotationStartCoords[1] = ps.mouseY;
  isDragging = true;
}

function mouseReleased(){
  isDragging = false;
}

/*
  RENDER
*/
function render(){
  if(isDragging === true){		
		// how much was the cursor moved compared to last time
		// this function was called?
    var deltaX = ps.mouseX - rotationStartCoords[0];
    var deltaY = ps.mouseY - rotationStartCoords[1];
		
		// now that the camera was updated, reset where the
		// rotation will start for the next time this function is called.
		rotationStartCoords = [ps.mouseX, ps.mouseY];

    cam.yaw(-deltaX * 0.02);
    cam.pitch(deltaY * 0.02);
	}

  var c = pointCloud.getCenter();
  ps.multMatrix(M4x4.makeLookAt(cam.position, cam.direction, cam.up));
  ps.translate(-cam.position[0]-c[0], -cam.position[1]-c[1], -cam.position[2]-c[2] );
  
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
    var filePath = "file:///" + event.dataTransfer.files[0].mozFullPath;
    var ext = filePath.split(".").pop().toLowerCase();
   
    // only accept point cloud files
    if(ext === "asc" || ext === "pts" || ext === "psi" || ext === "ply"){

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