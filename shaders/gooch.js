var gooch_vs =

"varying vec3 ViewVec;" +
"varying vec3 ecPos1;" +
"varying vec3 tnorm;" +

"varying vec4 frontColor;" +

"attribute vec3 ps_Vertex;" +
"attribute vec3 ps_Normal;" +
"attribute vec4 ps_Color;" +

"uniform float ps_PointSize;" +
"uniform vec3 ps_Attenuation;" +

"uniform vec3 lightPos;" +

"uniform mat4 ps_ModelViewMatrix;" +
"uniform mat4 ps_ProjectionMatrix;" +
"uniform mat4 ps_NormalMatrix;" +

"void main(void) {" +
"  vec3 transNorm = vec3(ps_NormalMatrix * vec4(ps_Normal, 0.0));" + 

"  vec4 ecPos4 = ps_ModelViewMatrix * vec4(ps_Vertex, 1.0);" +

"  frontColor = ps_Color;" +

"  if(ps_Normal == vec3(0.0, 0.0, 0.0)){" + 
"    frontColor = ps_Color; " + 
"  }" +

"  float dist = length(ecPos4);" +
"  float attn = ps_Attenuation[0] + " +
"              (ps_Attenuation[1] * dist) + " + 
"              (ps_Attenuation[2] * dist * dist);" +

"  tnorm = vec3(normalize(ps_NormalMatrix * vec4(ps_Normal, 0.0)));" +
"  ecPos1 = vec3(ecPos4); "+
"  ViewVec = normalize(-ecPos1);" + 

"  gl_PointSize = ps_PointSize * sqrt(1.0/attn);" +
"  gl_Position = ps_ProjectionMatrix * ecPos4;" +
"}";

var gooch_fs = 
"#ifdef GL_ES\n" +
"  precision highp float;\n" +
"#endif\n" +

"float DiffuseWarm = 0.5;" +
"float DiffuseCool = 0.5; " +

// parameters
"uniform vec3 surfaceColor;" +
"uniform vec3 warmColor;" +
"uniform vec3 coolColor;" +

"varying vec3 ViewVec; " +
"varying vec3 ecPos1; "+
"varying vec3 tnorm;" +

"void pointLight(in vec3 pos, in vec3 nviewVec, in vec3 ntnorm, inout float NdotL, inout float spec)" +
"{" +
"	vec3 lightVec = normalize(pos - ecPos1);" +
"	vec3 ReflectVec = normalize(reflect(lightVec, ntnorm));" +
"	NdotL = (dot(lightVec, ntnorm) + 1.0) * 0.5;" +
"	spec += max(dot(ReflectVec, -nviewVec), 0.0);" +
"}" +

"void c3dl_goochDirLight(in vec3 pos, in vec3 nviewVec, in vec3 ntnorm,  inout float NdotL, inout float spec)" +
"{"+
	// when the user specifies the the direction of the light, they are
	// specifying the direction the light is going towards.
"	vec3 lightVec = vec3(-pos);" +

	// calculate how intense the light is.  NdotL is added for each light.
" NdotL = (dot(lightVec, ntnorm) + 1.0) * 0.5;" +
" vec3 ReflectVec = normalize(reflect(lightVec, ntnorm));" +
" spec += max(dot(ReflectVec, -nviewVec), 0.0);" +
"}"+

/*
*/
"void main(void) {" + 

"	vec3 kcool = min(coolColor + DiffuseCool * surfaceColor, 1.0);"+
"	vec3 kwarm = min(warmColor + DiffuseWarm * surfaceColor, 1.0);" +

"	vec3 nviewVec = normalize(ViewVec);" +
"	vec3 ntnorm = normalize(tnorm);" +

"	float NdotL = 0.0;" +	
"	float spec = 0.0;" +

" pointLight(vec3(0.0, 10.0, -40.0), nviewVec, ntnorm, NdotL, spec); "+

"	NdotL = clamp(NdotL, 0.0, 1.0);"+

"	vec3 kfinal = mix(kcool, kwarm, NdotL);" +	
"	spec = pow(spec, 17.0);" +
"	gl_FragColor = vec4(min(kfinal + spec, 1.0), 1.0);" +
"}";
