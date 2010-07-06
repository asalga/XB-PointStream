/*
  Copyright (c) 2010  Seneca College
  MIT LICENSE

TODO:
- add mouseScroll empty var?
- change verts, norms, cols to webglarrays?
- should mousewheel return single value or object?
- add external js loading so mjs isn't present in html file
*/

function PointStream(){

  const version  = 0.2;
  const XHR_DONE = 4;
    
  // to calculate fps
  var frames = 0;
  var lastTime;
  
  var renderCallback;
  
  var bk = [1,1,1,1];
  var VBOs;
  
  // browser detection to handle differences such as mouse scrolling
  var browser     = -1 ;
  const MINEFIELD = 0;
  const CHROME    = 1;
  const CHROMIUM  = 2;
  const WEBKIT    = 3;

  // not used yet
  const FIREFOX   = 4;
  const OPERA     = 5;
  const SAFARI    = 6;
  const IE        = 7;
  
  var verts = [];
  var cols = [];
  var norms = [];

  var canvas;
  var ctx;

  var bufferIDCounter = 0;

  // shader matrices
  var projection;
  var view;
  var model;
  var normalTransform;

  var progObj;
        
  // Vertex shader for boxes and spheres
  var vertexShaderSource =
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
  "      gl_FrontColor = vec4(col[0], col[1], col[2], 1.0);" +
  "  }" +
  "  else {" +
  "      PointLight(finalDiffuse, ecPos, norm, eye );" +
  "      gl_FrontColor = vec4(finalDiffuse[0] * col[0], finalDiffuse[1] * col[1], finalDiffuse[2] * col[2], 1.0);" +
  "  }" +

  "  gl_PointSize = 3.0;" +
  "  gl_Position = projection * view * model * vec4( aVertex, 1.0 );" +
  "}";

  var fragmentShaderSource =
  "void main(void){" +
  "  gl_FragColor = gl_Color;" +
  "}";

  /**
  */
  function uniformi(programObj, varName, varValue) {
    var varLocation = ctx.getUniformLocation(programObj, varName);
    // the variable won't be found if it was optimized out.
    if (varLocation !== -1) {
      if (varValue.length === 4) {
        ctx.uniform4iv(varLocation, varValue);
      } else if (varValue.length === 3) {
        ctx.uniform3iv(varLocation, varValue);
      } else if (varValue.length === 2) {
        ctx.uniform2iv(varLocation, varValue);
      } else {
        ctx.uniform1i(varLocation, varValue);
      }
    }
  }

  /**
  */
  function uniformf(programObj, varName, varValue) {
    var varLocation = ctx.getUniformLocation(programObj, varName);
    // the variable won't be found if it was optimized out.
    if (varLocation !== -1) {
      if (varValue.length === 4) {
        ctx.uniform4fv(varLocation, varValue);
      } else if (varValue.length === 3) {
        ctx.uniform3fv(varLocation, varValue);
      } else if (varValue.length === 2) {
        ctx.uniform2fv(varLocation, varValue);
      } else {
        ctx.uniform1f(varLocation, varValue);
      }
    }
  }

  /**
  */
  function vertexAttribPointer(programObj, varName, size, VBO) {
    var varLocation = ctx.getAttribLocation(programObj, varName);
    if (varLocation !== -1) {
      ctx.bindBuffer(ctx.ARRAY_BUFFER, VBO);
      ctx.vertexAttribPointer(varLocation, size, ctx.FLOAT, false, 0, 0);
      ctx.enableVertexAttribArray(varLocation);
    }
  }
  
  /**
  */
  function createVBOs(xyz, rgb, norm){
    if(ctx){
      var newBuffer = ctx.createBuffer();
      ctx.bindBuffer(ctx.ARRAY_BUFFER, newBuffer);
      ctx.bufferData(ctx.ARRAY_BUFFER, new WebGLFloatArray(xyz), ctx.STATIC_DRAW);

      var newColBuffer = ctx.createBuffer();
      ctx.bindBuffer(ctx.ARRAY_BUFFER, newColBuffer);
      ctx.bufferData(ctx.ARRAY_BUFFER, new WebGLFloatArray(rgb), ctx.STATIC_DRAW);

      var newNormBuffer = ctx.createBuffer();
      ctx.bindBuffer(ctx.ARRAY_BUFFER, newNormBuffer);
      ctx.bufferData(ctx.ARRAY_BUFFER, new WebGLFloatArray(norm), ctx.STATIC_DRAW);

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

  /**
  */
  function disableVertexAttribPointer(programObj, varName){
   var varLocation = ctx.getAttribLocation(programObj, varName);
   if (varLocation !== -1) {
     ctx.disableVertexAttribArray(varLocation);
   }
  }
  
  /**
  */
  function getUserAgent(userAgentString){
    
    // keep in this order
    if(userAgentString.match(/Chrome/)){
      return CHROME;
    }
    if(userAgentString.match(/AppleWebKit/)){
      return WEBKIT;
    }
    if(userAgentString.match(/Minefield/)){
      return MINEFIELD;
    }
  }

  /**
  */
  function uniformMatrix(programObj, varName, transpose, matrix) {
    var varLocation = ctx.getUniformLocation(programObj, varName);
    // the variable won't be found if it was optimized out.
    if (varLocation !== -1) {
      if (matrix.length === 16) {
        ctx.uniformMatrix4fv(varLocation, transpose, matrix);
      } else if (matrix.length === 9) {
        ctx.uniformMatrix3fv(varLocation, transpose, matrix);
      } else {
        ctx.uniformMatrix2fv(varLocation, transpose, matrix);
      }
    }
  }

  /**
  */
  var createProgramObject = function(ctx, vetexShaderSource, fragmentShaderSource) {
    var vertexShaderObject = ctx.createShader(ctx.VERTEX_SHADER);
    ctx.shaderSource(vertexShaderObject, vetexShaderSource);
    ctx.compileShader(vertexShaderObject);
    if (!ctx.getShaderParameter(vertexShaderObject, ctx.COMPILE_STATUS)) {
      throw ctx.getShaderInfoLog(vertexShaderObject);
    }

    var fragmentShaderObject = ctx.createShader(ctx.FRAGMENT_SHADER);
    ctx.shaderSource(fragmentShaderObject, fragmentShaderSource);
    ctx.compileShader(fragmentShaderObject);
    if (!ctx.getShaderParameter(fragmentShaderObject, ctx.COMPILE_STATUS)) {
      throw ctx.getShaderInfoLog(fragmentShaderObject);
    }

    var programObject = ctx.createProgram();
    ctx.attachShader(programObject, vertexShaderObject);
    ctx.attachShader(programObject, fragmentShaderObject);
    ctx.linkProgram(programObject);
    if (!ctx.getProgramParameter(programObject, ctx.LINK_STATUS)) {
      throw "Error linking shaders.";
    }

    return programObject;
  };

  /**
  */
  var xb = {

    /**
    */
    mouseX: 0,
    mouseY: 0,
    
    // Number of frames per seconds rendered in the last second.
    frameRate: 0,
    
    // Number of frames rendered since script started running
    frameCount: 0,

    /**
    */
    background: function(a){
      ctx.clearColor(a[0],a[1],a[2],a[3]);
    },

    /**
    */
    clear: function(){
      ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
    },
    
    /**
      Get the version of the library.
    */
    getVersion: function(){
      return version;
    },
    
    /**
      Resize the viewport.
      This can be called after setup
    */
    resize: function(width, height){
      // delete old program object?
      // delete old context?
      
      canvas.setAttribute("width", width);
      canvas.setAttribute("height", height);

      // check if style exists? how? can't just query it...
      canvas.style.width = width;
      canvas.style.height = height;
      
      ctx = canvas.getContext("experimental-webgl");
      ctx.viewport(0, 0, width, height);
      ctx.enable(ctx.DEPTH_TEST);
      
      xb.background(bk);
      
      progObj = createProgramObject(ctx, vertexShaderSource, fragmentShaderSource);
      ctx.useProgram(progObj);
      
      projection = M4x4.$(1.7320508075688779,0,0,0,0,1.7320508075688779,0,0,0,0,-1.002002002002002,-8.668922960805196,0,0,-1,0);      
      view = M4x4.$(1,0,0,0,0,1,0,0,0,0,1,-50,0,0,0,1);
      model = M4x4.$(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
      normalTransform = M4x4.$(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);      
      
      if(VBOs) {
        VBOs = createVBOs(verts, cols, norms);
      }
      
      uniformf(progObj, "lcolor", [1,1,1]);
      uniformf(progObj, "lposition", [0,0,-1]);
      uniformi(progObj, "lightCount", 1);
      
      uniformMatrix(progObj, "view", false, M4x4.transpose(view));
      uniformMatrix(progObj, "projection", false, M4x4.transpose(projection));
    },
    
    /**
    */
    render: function(){
      frames++;
      xb.frameCount++;
      var now = new Date();

      if(ctx && VBOs){
        vertexAttribPointer(progObj, "aVertex", 3, VBOs.posBuffer);
        vertexAttribPointer(progObj, "aColor", 3, VBOs.colBuffer);
        vertexAttribPointer(progObj, "aNormal", 3, VBOs.normBuffer);

        var mvm = M4x4.mul(view, model);
        normalTransform = M4x4.inverseOrthonormal(mvm);
        uniformMatrix(progObj, "normalTransform", false, M4x4.transpose(normalTransform));
        
        uniformMatrix(progObj, "model", false, model);

        ctx.drawArrays(ctx.POINTS, 0, VBOs.size/3);
      }

      // if more than 1 second has elapsed, recalculate fps
      if(now - lastTime > 1000){
        xb.frameRate = frames/(now-lastTime)*1000;
        frames = 0;
        lastTime = now;
      }

      // clear state      
      model = M4x4.$(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
    },
 
    /**
      Update the cursor position everytime the mouse moves
    */
    mouseMove: function(e){
      xb.mouseX = e.pageX;
      xb.mouseY = e.pageY;
    },
    
    /**
    */
    attach: function(element, type, func){
      //
      if(element.addEventListener){
        element.addEventListener(type, func, false);
      }
    },
    
    /*
      returns -1 or 1
      scrolling towards user is 1
      scrolling towards screen is -1
      should this return an object or a single value?
    */
    _mouseScroll: function(evt){
      var delta = 0;
     
       // which check to use?
      //if(browser === MINEFIELD){
      if(evt.detail){
        delta = evt.detail / 3;
      }
      else if(evt.wheelDelta){
        delta = -evt.wheelDelta / 360;
      }
    
      if(xb.onMouseScroll){
        xb.onMouseScroll(delta);
      }
    },
    
    _mousePressed: function(evt){
      if(xb.onMousePressed){
        xb.onMousePressed();
      }
    },
    
    _mouseReleased: function(){
      if(xb.onMouseReleased){
        xb.onMouseReleased();
      }
    },
    
    /**
    */
    setup: function(cvs, renderCB){
      canvas = cvs;    
      browser = getUserAgent(navigator.userAgent);
      
      lastTime = new Date();
      frames = 0;
      
      xb.resize(canvas.getAttribute("width"), canvas.getAttribute("height"));
      
      xb.renderCallback = renderCB;
      setInterval(xb.renderCallback, 10);

      xb.attach(cvs, "mouseup", xb._mouseReleased);      
      xb.attach(cvs, "mousedown", xb._mousePressed);
      xb.attach(cvs, "mousemove", xb.mouseMove);      
      xb.attach(cvs, "DOMMouseScroll", xb._mouseScroll);
      xb.attach(cvs, "mousewheel", xb._mouseScroll);
    },
    
    /**
      1 arg = uniform scaling
      3 args = independant scaling
    */
    scale: function(sx, sy, sz){
    
      // uniform scaling
      if( !sy && !sz){
        model =  M4x4.scale1(sx, model);
      }
      else{
        model =  M4x4.scale3(sx, sy, sz, model);
      }
    },
    
    /**
     tx
     ty
     tz
    */
    translate: function(tx, ty, tz){
      model = M4x4.translate3(tx, ty, tz, model, model);
    },
    
    /**
    */
    rotateY: function(radians){
      model =  M4x4.rotate(radians,V3.$(0,1,0),model);
    },
    
    /**
    */
    rotateX: function(radians){
      model = M4x4.rotate(radians,V3.$(1,0,0),model);
    },
    
    /**
    */
    rotateZ: function(radians){
      model = M4x4.rotate(radians,V3.$(0,0,1),model);
    },
        
    /**
      o - object such as {path:"acorn.asc", autoCenter: true}
    */
    loadFile: function(o){
      var path = o.path;
      
      // need ||?
      var autoCenter = o.autoCenter || false;

      var AJAX = new XMLHttpRequest();
      
      // this doesn't work
      // AJAX.addEventListener("progress", f,false);

      AJAX.open("GET", path, true);
      AJAX.send(null);
      
      var file = {
        status: 0,
        progress: 0,
        numPoints: 0,
      };
      
      AJAX.onreadystatechange = 
      function(){        
        //??
        if(AJAX.status === 200){
          file.status = 1;
        }

        if(AJAX.readyState === XHR_DONE){
//document.getElementById('debug')."g;
//debug = "sdf";
//var blah = "";

           var values = AJAX.responseText.split(/\s+/);
           const numVerts = values.length/9;
           
           var objCenter = [0,0,0];
           
          // xyz  rgb  normals
          for(var i = 0, len = values.length; i < len; i += 9){
            var currX = parseFloat(values[i]);
            var currY = parseFloat(values[i+1]);
            var currZ = parseFloat(values[i+2]);

            verts.push(currX);
            verts.push(currY);
            verts.push(currZ);
            
            // don't waste cycles if the user didn't want it centered.
            if(autoCenter){
              objCenter[0] += currX;
              objCenter[1] += currY;
              objCenter[2] += currZ;
            }

            cols.push(parseInt(values[i+3])/255);
            cols.push(parseInt(values[i+4])/255);
            cols.push(parseInt(values[i+5])/255);
            
            norms.push(parseFloat(values[i+6]));
            norms.push(parseFloat(values[i+7]));
            norms.push(parseFloat(values[i+8]));
            
            //debug += "dfg";
            //document.getElementById('debug').innerHTML += 
            blah 
            +=
            currX + " " + currY + " " + currZ + " "  + 
            parseFloat(values[i+3]) + " " +
            parseFloat(values[i+4]) + " " +
            parseFloat(values[i+5]) + "\n";
            
          }
          //alert(blah);
          //debug +="asdfasdf";
          
          // if the user wants to center the point cloud
          if(autoCenter){
            objCenter[0] /= numVerts;
            objCenter[1] /= numVerts;
            objCenter[2] /= numVerts;
          }
          
          // if the user wanted to autocenter the point cloud,
          // iterate over all the verts and subtract by the 
          // point cloud's current center.
          if(autoCenter){
            for(var i = 0; i < numVerts; i++){
              verts[i*3]   -= objCenter[0];
              verts[i*3+1] -= objCenter[1];
              verts[i*3+2] -= objCenter[2]; 
            }
          }
          
          VBOs = createVBOs(verts, cols, norms);
          
          file.status = 4;
        }
      }
      return file;
    }

  }
  return xb;
};
