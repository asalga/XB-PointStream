var curContext;

    translate = function translate(x, y, z) {
        forwardTransform.translate(x, y, z);
    };

var newWebGLArray = function(data) {
  return new WebGLFloatArray(data);
}

var bufferIDCounter = 0;
        
var endBuffer = function(xyz,rgb,norm){
if(curContext){
  var newBuffer = curContext.createBuffer();
  curContext.bindBuffer(curContext.ARRAY_BUFFER, newBuffer);
  curContext.bufferData(curContext.ARRAY_BUFFER, newWebGLArray(xyz), curContext.STATIC_DRAW);

  var newColBuffer = curContext.createBuffer();
  curContext.bindBuffer(curContext.ARRAY_BUFFER, newColBuffer);
  curContext.bufferData(curContext.ARRAY_BUFFER, newWebGLArray(rgb), curContext.STATIC_DRAW);

  var newNormBuffer = curContext.createBuffer();
  curContext.bindBuffer(curContext.ARRAY_BUFFER, newNormBuffer);
  curContext.bufferData(curContext.ARRAY_BUFFER, newWebGLArray(norm), curContext.STATIC_DRAW);

  
  bufferIDCounter++;
  
  var o = {};
  o.id =  bufferIDCounter;
  o.posBuffer = newBuffer;
  o.colBuffer = newColBuffer;
  o.normBuffer = newNormBuffer;
  o.size = xyz.length;

  return o;
  }
};


var PMatrix3D = function PMatrix3D() {
  //When a matrix is created, it is set to an identity matrix
  this.reset();
};

PMatrix3D.prototype = {
set: function() {
  if (arguments.length === 16) {
    var a = arguments;
    this.set([a[0], a[1], a[2], a[3],
              a[4], a[5], a[6], a[7],
              a[8], a[9], a[10], a[11],
              a[12], a[13], a[14], a[15]]);
  } else if (arguments.length === 1 && arguments[0] instanceof PMatrix3D) {
    this.elements = arguments[0].array();
  } else if (arguments.length === 1 && arguments[0] instanceof Array) {
    this.elements = arguments[0].slice();
  }
},

reset: function() {
  this.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
},
// Returns a copy of the element values.
array: function array() {
  return this.elements.slice();
},
translate: function(tx, ty, tz) {
  if (typeof tz === 'undefined') {
    tz = 0;
  }

  this.elements[3] += tx * this.elements[0] + ty * this.elements[1] + tz * this.elements[2];
  this.elements[7] += tx * this.elements[4] + ty * this.elements[5] + tz * this.elements[6];
  this.elements[11] += tx * this.elements[8] + ty * this.elements[9] + tz * this.elements[10];
  this.elements[15] += tx * this.elements[12] + ty * this.elements[13] + tz * this.elements[14];
},
transpose: function() {
  var temp = this.elements.slice();
  this.elements[0] = temp[0];
  this.elements[1] = temp[4];
  this.elements[2] = temp[8];
  this.elements[3] = temp[12];
  this.elements[4] = temp[1];
  this.elements[5] = temp[5];
  this.elements[6] = temp[9];
  this.elements[7] = temp[13];
  this.elements[8] = temp[2];
  this.elements[9] = temp[6];
  this.elements[10] = temp[10];
  this.elements[11] = temp[14];
  this.elements[12] = temp[3];
  this.elements[13] = temp[7];
  this.elements[14] = temp[11];
  this.elements[15] = temp[15];
},


   };

var setMatrices = function(){
  curContext.useProgram(programObject3D);
  uniformMatrix(programObject3D, "view", true, modelView.array());
  uniformMatrix(programObject3D, "normalTransform", false, modelView.array());
};
    
var AJAX = new XMLHttpRequest();

var verts = [];
var magicbuffer;
var stillDownloading = true;
var ready = false;
var fps;

var aaa = [];
var bbb = [];
var ccc = [];

var canvass = 4;

function startIt(){

  canvass = document.getElementById('canvas');
  curContext = canvass.getContext("experimental-webgl");
 
  if(curContext){
    curContext.viewport(0, 0, 500,500);
    curContext.clearColor(204 / 255, 204 / 255, 204 / 255, 1.0);
    curContext.clear(curContext.COLOR_BUFFER_BIT | curContext.DEPTH_BUFFER);
    curContext.enable(curContext.DEPTH_TEST);
  }
  
  
        programObject3D = createProgramObject(curContext, vertexShaderSource3D, fragmentShaderSource3D);
        programObject2D = createProgramObject(curContext, vertexShaderSource2D, fragmentShaderSource2D);
   
      modelView = new PMatrix3D();
      projection = new PMatrix3D();      
      modelView.set(1,0,0,-250,0,1,0,-250,0,0,1,-433.0127018922194,0,0,0,1);
      projection.set(1.7320508075688779,0,0,0,0,1.7320508075688779,0,0,0,0,-1.002002002002002,-8.668922960805196,0,0,-1,0);

      forwardTransform = modelView;
      curContext.useProgram(programObject2D);
      
      var tproj = new PMatrix3D();
      tproj.set(projection);
      tproj.transpose();
      uniformMatrix(programObject2D, "projection", false, tproj.array());
      
      curContext.useProgram(programObject3D);
      uniformMatrix(programObject3D, "model", false, [1,0,0,0,  0,1,0,0,  0,0,1,0,  0,0,0,1]);
      uniformMatrix(programObject3D, "projection", false, tproj.array());
      
      
      //alert("end start it" + curContext);
}

function changed(){
  if(AJAX.readyState === 4){
  
     var values = AJAX.responseText.split(/\s+/);

    // xyz  rgb  normals
    for(var i = 0, len = values.length; i < len; i += 9){
      verts.push(parseFloat(values[i+0]));
      verts.push(parseFloat(values[i+1]));
      verts.push(parseFloat(values[i+2]));
    }
    stillDownloading = false;

          for(var i = 0, len = verts.length; i < len; i+=3)
          {
            aaa.push(verts[i],verts[i+1],verts[i+2]);
            bbb.push(verts[i],verts[i+1],verts[i+2]);
            ccc.push(verts[i],verts[i+1],verts[i+2]);
          }

       stillDownloading = true;
        ready = true;


       startIt();
        magicbuffer = endBuffer(aaa, bbb, ccc);

    
          modelView.set(1,0,0,-250,0,1,0,-250,0,0,1,-433.0127018922194,0,0,0,1);


      if(ready){
        translate(250,250, 400);
        setMatrices();
        drawSplats(magicbuffer);
      }
  }
}
 
  AJAX.onreadystatechange = changed;
  AJAX.open("GET", "acorn1.asc", true);
  AJAX.send(null);

var forwardTransform,
modelView,
projection;
var programObject3D;
var programObject2D;

drawSplats = function(buff) {
  curContext.useProgram(programObject3D);
  vertexAttribPointer(programObject3D, "aVertex", 3, buff.posBuffer);
  vertexAttribPointer(programObject3D, "aColor", 3, buff.colBuffer);
  vertexAttribPointer(programObject3D, "aNormal", 3, buff.normBuffer);
  curContext.drawArrays(curContext.POINTS, 0, buff.size/3);
};

    function uniformf(programObj, varName, varValue) {
      var varLocation = curContext.getUniformLocation(programObj, varName);
      // the variable won't be found if it was optimized out.
      if (varLocation !== -1) {
        if (varValue.length === 4) {
          curContext.uniform4fv(varLocation, varValue);
        } else if (varValue.length === 3) {
          curContext.uniform3fv(varLocation, varValue);
        } else if (varValue.length === 2) {
          curContext.uniform2fv(varLocation, varValue);
        } else {
          curContext.uniform1f(varLocation, varValue);
        }
      }
    }

    function uniformi(programObj, varName, varValue) {
      var varLocation = curContext.getUniformLocation(programObj, varName);
      // the variable won't be found if it was optimized out.
      if (varLocation !== -1) {
        if (varValue.length === 4) {
          curContext.uniform4iv(varLocation, varValue);
        } else if (varValue.length === 3) {
          curContext.uniform3iv(varLocation, varValue);
        } else if (varValue.length === 2) {
          curContext.uniform2iv(varLocation, varValue);
        } else {
          curContext.uniform1i(varLocation, varValue);
        }
      }
    }

    function vertexAttribPointer(programObj, varName, size, VBO) {
      var varLocation = curContext.getAttribLocation(programObj, varName);
      if (varLocation !== -1) {
        curContext.bindBuffer(curContext.ARRAY_BUFFER, VBO);
        curContext.vertexAttribPointer(varLocation, size, curContext.FLOAT, false, 0, 0);
        curContext.enableVertexAttribArray(varLocation);
      }
    }

   function disableVertexAttribPointer(programObj, varName){
     var varLocation = curContext.getAttribLocation(programObj, varName);
     if (varLocation !== -1) {
       curContext.disableVertexAttribArray(varLocation);
     }
   }

    function uniformMatrix(programObj, varName, transpose, matrix) {
      var varLocation = curContext.getUniformLocation(programObj, varName);
      // the variable won't be found if it was optimized out.
      if (varLocation !== -1) {
        if (matrix.length === 16) {
          curContext.uniformMatrix4fv(varLocation, transpose, matrix);
        } else if (matrix.length === 9) {
          curContext.uniformMatrix3fv(varLocation, transpose, matrix);
        } else {
          curContext.uniformMatrix2fv(varLocation, transpose, matrix);
        }
      }
    }

    var createProgramObject = function(curContext, vetexShaderSource, fragmentShaderSource) {
      var vertexShaderObject = curContext.createShader(curContext.VERTEX_SHADER);
      curContext.shaderSource(vertexShaderObject, vetexShaderSource);
      curContext.compileShader(vertexShaderObject);
      if (!curContext.getShaderParameter(vertexShaderObject, curContext.COMPILE_STATUS)) {
        throw curContext.getShaderInfoLog(vertexShaderObject);
      }

      var fragmentShaderObject = curContext.createShader(curContext.FRAGMENT_SHADER);
      curContext.shaderSource(fragmentShaderObject, fragmentShaderSource);
      curContext.compileShader(fragmentShaderObject);
      if (!curContext.getShaderParameter(fragmentShaderObject, curContext.COMPILE_STATUS)) {
        throw curContext.getShaderInfoLog(fragmentShaderObject);
      }

      var programObject = curContext.createProgram();
      curContext.attachShader(programObject, vertexShaderObject);
      curContext.attachShader(programObject, fragmentShaderObject);
      curContext.linkProgram(programObject);
      if (!curContext.getProgramParameter(programObject, curContext.LINK_STATUS)) {
        throw "Error linking shaders.";
      }

      return programObject;
    };



        var vertexShaderSource2D =
      "attribute vec3 Vertex;" +
      "uniform vec4 color;" +

      "uniform mat4 model;" +
      "uniform mat4 view;" +
      "uniform mat4 projection;" +

      "void main(void) {" +
      "  gl_FrontColor = color;" +
      "  gl_Position = projection * view * model * vec4(Vertex, 1.0);" +
      "}";
      

    var fragmentShaderSource2D =
      "void main(void){" +
      "  gl_FragColor = gl_Color;" +
      "}";


    // Vertex shader for points and lines
    var vShaderSrcUnlitShape =
      "attribute vec3 aVertex;" +
      "attribute vec4 aColor;" +

      "uniform mat4 uView;" +
      "uniform mat4 uProjection;" +

      "void main(void) {" +
      "  gl_FrontColor = aColor;" +
      "  gl_Position = uProjection * uView * vec4(aVertex, 1.0);" +
      "}";

    var fShaderSrcUnlitShape =
      "void main(void){" +
      "  gl_FragColor = gl_Color;" +
      "}";

    // Vertex shader for boxes and spheres
    var vertexShaderSource3D =
      "attribute vec3 aVertex;" +
      "attribute vec3 aNormal;" +
      "attribute vec4 aColor;" +

      "uniform bool usingMat;" +
      "uniform vec3 specular;" +
      "uniform vec3 mat_emissive;" +
      "uniform vec3 mat_ambient;" +
      "uniform vec3 mat_specular;" +
      "uniform float shininess;" +

      "uniform mat4 model;" +
      "uniform mat4 view;" +
      "uniform mat4 projection;" +
      "uniform mat4 normalTransform;" +

      "uniform int lightCount;" +
    
    "  uniform vec3 lposition;" +
    "  uniform vec3 lcolor;" +

      "void DirectionalLight( inout vec3 col, in vec3 ecPos, in vec3 vertNormal ) {" +
      "  float nDotVP = max(0.0, dot( vertNormal, lposition ));" +
      "  float nDotVH = max(0.0, dot( vertNormal, normalize( lposition-ecPos )));" +
      "  col += lcolor * 2.0 * nDotVP;" +
      "}" +

   "void PointLight( inout vec3 col, in vec3 ecPos,  in vec3 vertNormal, in vec3 eye ) {" +
     // "  float powerfactor;" +

      // Get the vector from the light to the vertex
      "   vec3 VP = lposition - ecPos;" +

      // Get the distance from the current vector to the light position
      "  float d = length( VP ); " +

      // Normalize the light ray so it can be used in the dot product operation.
      "  VP = normalize( VP );" +

      "  float attenuation = 1.0 / ( 1.0 + ( d ) + ( d * d ));" +

      "  float nDotVP = max( 0.0, dot( vertNormal, VP ));" +
      "  vec3 halfVector = normalize( VP + eye );" +
      "  float nDotHV = max( 0.0, dot( vertNormal, halfVector ));" +

     // "  spec += specular * powerfactor * attenuation;" +
      "  col += lcolor * nDotVP * 2.0;" +
      "}" +

      "void main(void) {" +
      "  vec3 finalDiffuse = vec3( 0.0, 0.0, 0.0 );" +
      
      "  vec4 col = aColor;" +

      "  vec3 norm = vec3( normalTransform * vec4( aNormal, 0.0 ) );" +

      "  vec4 ecPos4 = view * model * vec4(aVertex,1.0);" +
      "  vec3 ecPos = (vec3(ecPos4))/ecPos4.w;" +
      "  vec3 eye = vec3( 0.0, 0.0, 1.0 );" +

      // If there were no lights this draw call, just use the
      // assigned fill color of the shape and the specular value
      "  if( lightCount == 0 ) {" +
      //"    gl_FrontColor = abs(vec4( aNormal[0], aNormal[1], aNormal[2], 1.0));" +
      "      gl_FrontColor = vec4(col[0], col[1], col[2], 1.0);" +
      "  }" +
      "  else {" +
      "      PointLight(finalDiffuse, ecPos, norm, eye );" +
      "      gl_FrontColor = vec4(finalDiffuse[0] * col[0], finalDiffuse[1] * col[1], finalDiffuse[2] * col[2], 1.0);" +
      "  }" +

      "  gl_PointSize = 3.0;" +
      "  gl_Position = projection * view * model * vec4( aVertex, 1.0 );" +
      "}";

    var fragmentShaderSource3D =
      "void main(void){" +
      "  gl_FragColor = gl_Color;" +
      "}";

