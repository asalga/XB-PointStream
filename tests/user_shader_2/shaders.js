var cel_fragShader = 
"#ifdef GL_ES\n" +
"  precision highp float;\n" +
"#endif\n" +

"varying vec4 frontColor;" +
"void main(void){" +
"  gl_FragColor = frontColor;" +
"}";

var cel_vertShader = 
"varying vec4 frontColor;" +

"attribute vec3 ps_Vertex;" +
"attribute vec3 ps_Normal;" +
"attribute vec4 ps_Color;" +

"uniform float ps_PointSize;" +
"uniform vec3 XBPS_attenuation;" +

"uniform mat4 ps_ModelViewMatrix;" +
"uniform mat4 ps_ProjectionMatrix;" +
"uniform mat4 ps_NormalMatrix;" +

"void PointLight(inout float intensity, in vec3 ecPos, in vec3 vertNormal) {" +
"  vec3 VP = vec3(0.0, 50.0, 100.0) - ecPos;" +
"  VP = normalize( VP );" +
"  intensity = max( 0.0, dot( vertNormal, VP ));" +
"}" +

"void main(void) {" +
"  vec3 transNorm = vec3(ps_NormalMatrix * vec4(ps_Normal, 0.0));" + 
"  vec4 ecPos4 = ps_ModelViewMatrix * vec4(ps_Vertex, 1.0);" +

"  float intensity;" +
"  PointLight(intensity, vec3(ecPos4), transNorm);" +

"  if(intensity <= 0.6){ intensity = 0.5;}" +
"  else if(intensity <= 0.8){ intensity = 0.8;}" +
"  else if(intensity <= 1.0){ intensity = 1.0;}" +
   
"  frontColor = ps_Color * vec4(intensity, intensity, intensity, 1.0);" +

"  float dist = length( ecPos4 );" +
"  float attn = XBPS_attenuation[0] + " +
"              (XBPS_attenuation[1] * dist) + " + 
"              (XBPS_attenuation[2] * dist * dist);" +

"  if(attn > 0.0){" +
"    gl_PointSize = ps_PointSize * sqrt(1.0/attn);" +
"  }" +
"  else{" +
"    gl_PointSize = 1.0;" +
"  }"+

"  gl_Position = ps_ProjectionMatrix * ecPos4;" +
"}";

var scan_fragShader = 
"#ifdef GL_ES\n" +
"  precision highp float;\n" +
"#endif\n" +

"varying vec4 frontColor;" +
"void main(void){" +
"  if(mod(gl_FragCoord.y, 2.0) == 0.5) discard;" +
"  gl_FragColor = frontColor;" +
"}";

var scan_vertShader = 
"varying vec4 frontColor;" +

"attribute vec3 ps_Vertex;" +
"attribute vec4 ps_Color;" +

"uniform float ps_PointSize;" +
"uniform vec3 XBPS_attenuation;" +

"uniform mat4 ps_ModelViewMatrix;" +
"uniform mat4 ps_ProjectionMatrix;" +
"uniform mat4 ps_NormalMatrix;" +

"void main(void) {" +
"  frontColor =  ps_Color;" +

"  vec4 ecPos4 = ps_ModelViewMatrix * vec4(ps_Vertex, 1.0);" +
"  float dist = length( ecPos4 );" +
"  float attn = XBPS_attenuation[0] + " +
"              (XBPS_attenuation[1] * dist) + " + 
"              (XBPS_attenuation[2] * dist * dist);" +

"  if(attn > 0.0){" +
"    gl_PointSize = ps_PointSize * sqrt(1.0/attn);" +
"  }" +
"  else{" +
"    gl_PointSize = 1.0;" +
"  }"+

"  gl_Position = ps_ProjectionMatrix * ecPos4;" +
"}";
