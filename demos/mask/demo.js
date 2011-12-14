var ps, pointCloud;

// If these values aren't set and the device used does
// not support MozOrientation, nothing will render.
var x = 0;
var y = 0;

function pointLight(light){
  var lightName = "lights" + light.id;
  ps.uniformi( lightName + ".isOn", true);
  ps.uniformf( lightName + ".position", light.position);
  ps.uniformi( lightName + ".type", 2);
  ps.uniformf( lightName + ".attenuation", light.attenuation);
  
  if(light.ambient){ps.uniformf( lightName + ".ambient", light.ambient);}
  if(light.diffuse){ps.uniformf( lightName + ".diffuse", light.diffuse);}
  if(light.specular){ps.uniformf( lightName + ".specular", light.specular);}
}


function render() {
  ps.translate(0, 0, -50);

  // When the user tilts the device down, the point cloud
  // should rotate about X in the opposite direction
  // which gives the illusion the point cloud is behind the device  
  var invertX = document.getElementById('invert').checked ? -1 : 1;
  ps.rotateX(x * invertX * 2.5);
  ps.rotateY(y * 2.5);
  
  var c = pointCloud.getCenter();
  ps.translate(-c[0], -c[1], -c[2]);
  
  ps.clear();
  ps.render(pointCloud);
}

function handleOrientation(eventData){
  // swap the values to make the orientation make sense.
  // if the device is pitched forward or backward, (moz y)
  // convert to a rotation about x.

  // if the device is rolled left or right, (moz x)
  // convert to a rotation about y
  if(eventData.gamma){
    y = -eventData.gamma/70;
    x = eventData.beta/70;
  }
  else if(eventData.x){
  }
  else if(eventData.accelerationIncludingGravity){
    y = eventData.accelerationIncludingGravity.x;
    x = eventData.accelerationIncludingGravity.y;
  }
}

function start(){
  ps = new PointStream();
  ps.setup(document.getElementById('canvas'));
  ps.background([0.3, 0.5, 0.6, 0.6]);

  var vert = ps.getShaderStr("../../shaders/fixed_function.vs");
  var frag = ps.getShaderStr("../../shaders/fixed_function.fs");
  var progObj = ps.createProgram(vert, frag);
  ps.useProgram(progObj);
  ps.pointSize(10);
  
 pointLight({id:0, ambient:[.2,.2,.2], diffuse:[.7,.7,.7], attenuation:[1,0,0], position: [0,0,1]});

  addEventListener("devicemotion", handleOrientation, false);
  addEventListener("deviceorientation", handleOrientation, false);
  
  ps.onRender = render;
  
  pointCloud = ps.load("../../clouds/mask_70K_n.psi");
}
