/**
 @class c3dl.OrbitCamera is a camera which is restricted to orbiting 
 a point in space.  The camera orbits the point by moving along an imaginary 
 sphere which is centered on the point.<br /><br />
 
 OrbitCamera is generally used to orbit meshes, but isn't limited to doing so 
 since any point in space can be orbitted. However, since orbitting a mesh is 
 so common, distance limits can be assigned to the camera, which prevent it from
 entering or going to far from the mesh.<br /><br />
 
 If an object is being orbitted and the object moves, the camera must be set to 
 orbit the new object's position. This can be done by calling setOrbitPoint() and
 passing in the new object's position.<br /><br />
 
 When an OrbitCamera is created, it will be have the position and orbit point 
 at [0,0,0]. It will be looking down the -Z axis and have a closest and farthest 
 distance of 0.<br /><br />
 
 If the OrbitCamera's closest distance is set to a value which is greater than its 
 current distance, the camera will be 'backed up' so it has a distance equal to the 
 closest distance.  Similarly, setting the farthest distance to a smaller value may 
 also move the camera closer to the orbit point.
*/
var Cam = (function(){

  function Cam() {
  
    // This value cannot be set to less than 0.
    var closestDistance = 0;
    var fartestDistance = 2;
    
    // the point in space the camera will 'orbit'.
    var orbitPoint = V3.$(0,0,0);

    var left = V3.$(-1, 0, 0);
    var up =   V3.$( 0, 1, 0);
    var dir =  V3.$( 0, 0,-1);
    var pos =  V3.$( 0, 0, 2);
    

    /**
      Get the closest distance the camera can reside from the orbit point.
 
      @returns {float} The closest distance camera can reside from the orbit point.
    */
    this.__defineGetter__("closestDistance", function(){
      return closestDistance;
    });
    
    this.__defineGetter__("fartestDistance", function(){
      return fartestDistance;
    });
    
    this.__defineGetter__("orbitPoint", function(){
      return V3.clone(orbitPoint);
    });
    
    this.__defineGetter__("distance", function(){    
      return V3.length(V3.sub(pos, orbitPoint));
    });

    this.__defineGetter__("position", function(){    
      return V3.clone(pos);
    });    
    
    this.goCloser  = function(distance){
      // A negative value for goCloser() could be allowed and would
      // mean moving farther using a positive value, but this could
      // create some confusion and is therefore not permitted.
      if (distance > 0){
        // scale it
        var shiftAmt = V3.scale(this.dir, distance);
        var temp = V3.sub(this.pos, this.orbitPoint);

        var maxMoveCloser = V3.length(temp) - this.closestDistance;

        if (V3.length(shiftAmt) <= maxMoveCloser)
        {
          this.pos = V3.add(this.pos, shiftAmt);
        }
      }
    }
    
    
  this.pitch = function(angle){
    if (pos[0] == this.orbitPoint[0] &&
        pos[1] == this.orbitPoint[1] &&
        pos[2] == this.orbitPoint[2])
    {/*
      // Create a proper Quaternion based on location and angle.
      // we will rotate about the global up axis.
      var rotMat = c3dl.quatToMatrix(c3dl.axisAngleToQuat(this.left, angle));

      // 
      this.dir = c3dl.multiplyMatrixByVector(rotMat, this.dir);
      this.dir = c3dl.normalizeVector(this.dir);

      // update up vector
      this.up = c3dl.vectorCrossProduct(this.dir, this.left);
      this.up = c3dl.normalizeVector(this.up);

      // left does not change.*/
    }
    else
    {
      // get position relative to orbit point
      pos = V3.sub(pos, orbitPoint);

      var rotMat = M4x4.makeRotate(angle, left);
      
      var newpos = V3.mul4x4(rotMat, pos);
      pos = V3.add(newpos, orbitPoint);

      // 
      dir = V3.sub(orbitPoint, pos);
      dir = V3.normalize(dir);

      // update up vector
      up = V3.cross(dir, left);
      up = V3.normalize(up);

      // update left
      left = V3.cross(up, dir);
      left = V3.normalize(left);
    }
  };
    }
  
  
  return Cam;
}());
  
