varying vec4 frontColor;

attribute vec3 ps_Vertex;

// intensity values are placed in ps_Color[0]
attribute vec4 ps_Color;

uniform float ps_PointSize;
uniform vec3 ps_Attenuation;
uniform int millis;

uniform mat4 ps_ModelViewMatrix;
uniform mat4 ps_ProjectionMatrix;
uniform mat4 ps_NormalMatrix;

void main(void){
  frontColor =  vec4(0.0, 0.5, 0.9, 1.0);
  float millisf = float(millis);
  vec3 v = ps_Vertex;

  // fade in
  if(millis < 9000){ 
    float diff = millisf/20.0 - ps_Vertex.y;
 
    if(ps_Vertex.y < millisf/20.0){
      frontColor.b = min(diff/100.0, 1.0) * 0.9 ; 
      frontColor.g = min(diff/100.0, 1.0) * 0.5;
    }
    else{
      frontColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
  }

  // ripples
  if(millis > 20000 && millis < 35000){
    float t = float(millis - 20000)/10.0;
    float d = 3.0 * length(ps_Vertex - vec3(110.0, 130.0, 0.0));
    
    float test = t-d;
    if(abs(test) < 150.0){
      frontColor.r += 0.9 * abs(sin(test/100.0));
      frontColor.b -= 0.8 * abs(sin(test/140.0));
    }
  }

  // rainbow
  if(millis > 34500){
    float c = millisf;
    if(c >= 44000.0){
      c = 44000.0;
    }
    float freq = 0.3;
    frontColor.r = sin(freq * c/500.0) * 0.5 + 0.5;
    frontColor.g = sin(freq * c/500.0 + 2.0) * 0.5 + 0.5;
    frontColor.b = sin(freq * c/500.0 + 4.0) * 0.5 + 0.5;
  }

  // fade out
  float offset = millisf-50000.0;

  if(millis > 49000){
    float diff = (offset)/60.0 - ps_Vertex.y;
    if(ps_Vertex.y < (offset)/60.0){
      frontColor.g = 0.5 - diff/30.0;
      frontColor.r = 1.0 - diff/30.0;
       
      v.y -= (diff*diff);
    }
  }

  vec4 ecPos4 = ps_ModelViewMatrix * vec4(v, 1.0);

  float dist = length(ecPos4);

  float attn = ps_Attenuation[0] +
              (ps_Attenuation[1] * dist) + 
              (ps_Attenuation[2] * dist * dist);

  gl_PointSize = (attn > 0.0) ? ps_PointSize * sqrt(1.0/attn) : 1.0;

  gl_Position = ps_ProjectionMatrix * ecPos4;
}
