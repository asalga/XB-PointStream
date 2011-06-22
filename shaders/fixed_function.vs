varying vec4 frontColor;

attribute vec3 ps_Vertex;
attribute vec3 ps_Normal;
attribute vec3 ps_Color;

uniform float ps_PointSize;
uniform vec3 ps_Attenuation;

uniform mat4 ps_ModelViewMatrix;
uniform mat4 ps_ProjectionMatrix;
uniform mat4 ps_NormalMatrix;

// careful changing the order of these fields. Some cards have issues with 
// memory alignment
struct Light {
  int type;
  bool isOn;

  vec3 ambient;
  vec3 diffuse;
  vec3 specular; 

  vec3 position;
  vec3 direction;
  float angle;
  vec3 halfVector;
  float concentration;
};

// nVidia cards have issues with arrays of structures so instead we create 
// 8 instances of Light
uniform Light lights0;
uniform Light lights1;
uniform Light lights2;
uniform Light lights3;
uniform Light lights4;
uniform Light lights5;
uniform Light lights6;
uniform Light lights7;

// GLSL does not support switch
Light getLight(int index){
  if(index == 0) return lights0;
  if(index == 1) return lights1;
  if(index == 2) return lights2;
  if(index == 3) return lights3;
  if(index == 4) return lights4;
  if(index == 5) return lights5;
  if(index == 6) return lights6;
  // some cards complain that not all paths return if we have this last one 
  // in a conditional.
  return lights7;
}

// Material properties
uniform bool matOn; 
uniform vec3 matAmbient; 
uniform vec3 matDiffuse;
uniform vec3 matSpecular; 
uniform float matShininess;

/*
*/
void PointLight(inout vec3 ambient, inout vec3 diffuse, inout vec3 specular, in vec3 vertNormal, 
	in vec3 ecPos, in Light light){
  float powerfactor;
  
  // Get the vector from the light to the vertex
  vec3 VP = light.position - ecPos;

  // Get the distance from the current vector to the light position
  float d = length( VP );

  // Normalize the light ray so it can be used in the dot product operation.
  VP = normalize( VP );

  //float attenuation = 1.0 / ( falloff[0] + ( falloff[1] * d ) + ( falloff[2] * d * d ));
  float attenuation = 1.0 / ( 1.0 + 0.0 + 0.0);

  float nDotVP = max( 0.0, dot( vertNormal, VP ));
  vec3 halfVector = normalize( VP - normalize(ecPos) );
  float nDotHV = max( 0.0, dot( vertNormal, halfVector ));

  if( nDotVP == 0.0) {
    powerfactor = 0.0;
  }
  else{
    powerfactor = pow( nDotHV, matShininess);
  }
	
  ambient += light.ambient * attenuation; 
  diffuse += light.diffuse * nDotVP * attenuation;
  specular += light.specular * powerfactor * attenuation;
}

/*
*/
void main(void) {
  vec3 transNorm = vec3(ps_NormalMatrix * vec4(ps_Normal, 0.0)); 

  vec4 ecPos4 = ps_ModelViewMatrix * vec4(ps_Vertex, 1.0);
  vec3 ecPos = (vec3(ecPos4))/ecPos4.w;

  // calculate color
  vec3 finalAmbient = vec3(0.0, 0.0, 0.0);
  vec3 finalDiffuse = vec3(0.0, 0.0, 0.0);
  vec3 finalSpecular = vec3(0.0, 0.0, 0.0);

  if(ps_Normal == vec3(0.0, 0.0, 0.0)){
    frontColor = vec4(ps_Color, 1.0); 
  }
  else{
    if(lights0.isOn){
      PointLight(finalAmbient, finalDiffuse, finalSpecular, transNorm, ecPos, lights0);
    }
  }


if(matOn){
  frontColor = vec4(  (ps_Color * matAmbient *  finalAmbient) + 
                      (ps_Color * matDiffuse *  finalDiffuse) +  
                      (ps_Color * matSpecular *  finalSpecular), 1.0); 
} 
else{
  frontColor = vec4(	(ps_Color * finalAmbient) + 
						(ps_Color * finalDiffuse)  + 
                     	(ps_Color * finalSpecular),  1.0);
}


  float dist = length(ecPos4);
  float attn = ps_Attenuation[0] + 
              (ps_Attenuation[1] * dist) + 
              (ps_Attenuation[2] * dist * dist);

  gl_PointSize = ps_PointSize * sqrt(1.0/attn);
  gl_Position = ps_ProjectionMatrix * ecPos4;
}
