var ps, cylinder, plane;
var r = 0;

function render() {

  ps.translate(0, 0, -3);
  ps.rotateX(r+=0.01);
  
  ps.clear();
  ps.render(cylinder);
  ps.render(plane);
}

function baseLight(light){
  var lightName = "lights" + light.id;
  ps.uniformi( lightName + ".isOn", true);

  ps.uniformf( lightName + ".position", light.position);
  
  if(light.ambient){ps.uniformf( lightName + ".ambient", light.ambient);}
  if(light.diffuse){ps.uniformf( lightName + ".diffuse", light.diffuse);}
  if(light.specular){ps.uniformf( lightName + ".specular", light.specular);}
}

function dirLight(light){
  baseLight(light);
  ps.uniformi( "lights" + light.id + ".type", 1);
}
  
function start(){
  ps = new PointStream(); 
  ps.setup(document.getElementById('canvas'));
  ps.registerParser("fake", FAKEParser);
  ps.background([0, 0, 0, 1.0]);

  var vert = ps.getShaderStr("../../shaders/fixed_function.vs");
  var frag = ps.getShaderStr("../../shaders/fixed_function.fs");
  
  fixedFunctionProg = ps.createProgram(vert, frag);
  ps.useProgram(fixedFunctionProg);

  // must be >= 1, otherwise we see artefacts this needs to be fixed.
  ps.uniformf("matShininess", 1);
  dirLight({id:1, ambient:[0.1, 0.1, 0.1], diffuse:[0.7,0.7,0.7], position:[0,0,1]});
  
  ps.onRender = render;
  
  ps.pointSize(2);
  cylinder = ps.load("cylinder.fake");
  plane = ps.load("plane.fake");
}
