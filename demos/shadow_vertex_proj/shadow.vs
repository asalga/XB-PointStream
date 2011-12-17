attribute vec3 ps_Vertex;
attribute vec4 ps_Color;

varying vec4 frontColor;

uniform float ps_PointSize;
uniform vec3 ps_Attenuation;

uniform vec3 lightPos;
uniform bool drawShadow;
uniform vec3 objCenter;

uniform mat4 ps_ModelViewMatrix;
uniform mat4 ps_ProjectionMatrix;

void drawShadow(in vec3 l, in vec4 v){

  // Calculate rise / run   
  float slopeX = (l.y-v.y)/(l.x-v.x);
  float slopeZ = (l.y-v.y)/(l.z-v.z); 

  // We need to flatten by making all the y components the same.
  v.y = 0.0;
  v.x = l.x - (l.y / slopeX);
  v.z = l.z - (l.y / slopeZ);

  gl_Position = ps_ProjectionMatrix * ps_ModelViewMatrix * v;
  frontColor = vec4(0.0, 0.0, 0.0, 1.0);
}

void main(void){
  vec4 vert = vec4(ps_Vertex, 1.0);
  
  float dist = length( vert );
  float attn = ps_Attenuation[0] + 
              (ps_Attenuation[1] * dist) + 
              (ps_Attenuation[2] * dist * dist);

  if(attn <= 0.0){ attn = 1.0;}

  gl_PointSize = ps_PointSize * sqrt(1.0/attn);
  
  if(drawShadow){
    drawShadow(lightPos, vert);
  }
  else{
    frontColor = ps_Color;
    gl_Position = ps_ProjectionMatrix * ps_ModelViewMatrix * vert;
  }
}
