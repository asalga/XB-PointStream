var vertShader = 
"varying vec4 frontColor;" +

"attribute vec3 ps_Vertex;" +
"attribute vec3 ps_Normal;" +

"uniform float ps_PointSize;" +
"uniform vec3 ps_Attenuation;" +

"uniform vec3 lightPos;" + 

"uniform mat4 ps_ModelViewMatrix;" +
"uniform mat4 ps_ProjectionMatrix;" +
"uniform mat4 ps_NormalMatrix;" +

"void PointLight(inout vec3 col, in vec3 ecPos, in vec3 vertNormal) {" +
"  vec3 VP = lightPos - ecPos;" +
"  VP = normalize( VP );" +
"  float nDotVP = max( 0.0, dot( vertNormal, VP ));" +
"  col = vec3(0.04, 0.04, 0.04) * nDotVP;" +
"}" +

"void main(void) {" +
"  vec3 transNorm = vec3(ps_NormalMatrix * vec4(ps_Normal, 0.0));" + 
 
"  vec4 ecPos4 = ps_ModelViewMatrix * vec4(ps_Vertex, 1.0);" +

"  vec3 col = vec3(0.0, 0.0, 0.0);" +
"  PointLight(col, vec3(ecPos4), transNorm);" +

"  frontColor = vec4(col, 1.0);" +

"  float dist = length( ecPos4 );" +
"  float attn = ps_Attenuation[0] + " +
"              (ps_Attenuation[1] * dist) + " + 
"              (ps_Attenuation[2] * dist * dist);" +

"  gl_PointSize = ps_PointSize * sqrt(1.0/attn);" +
"  gl_Position = ps_ProjectionMatrix * ecPos4;" +
"}";

var fragShader = 
"#ifdef GL_ES\n" +
"  precision highp float;\n" +
"#endif\n" +

"varying vec4 frontColor;" +
"void main(void){" +
"  gl_FragColor = frontColor;" +
"}";
