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

  const version  = 0.3;
  const XHR_DONE = 4;
    
  // to calculate fps
  var frames = 0;
  var lastTime;
  
  var renderCallback;
  
  var bk = [1,1,1,1];
  var VBOs;
  
  // defaults
  var attn = [0.01, 0.0, 0.003];
    
  // browser detection to handle differences such as mouse scrolling
  var browser     = -1;
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
  
  //
  "uniform float pointSize;" +
  "uniform vec3 attenuation;" +
  
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

  "  float dist = length( view * model * vec4(aVertex, 1.0));" +
    "float attn = attenuation[0] + (attenuation[1] * dist) + (attenuation[2] * dist * dist);" +

  "  if(attn > 0.0){" +
  "    gl_PointSize = pointSize * sqrt(1.0/attn);" +
  "  }" +
  "  else{" +
  "    gl_PointSize = 1.0;" +
  "  }"+
  
  "  gl_Position = projection * view * model * vec4(aVertex, 1.0);" +
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
  function getDataLayout(values){
    var normalsPresent = false;
    var colorsPresent = false;
    
    // first check if there are 9 values, which would mean we have
    // xyz rgb and normals
    
    // We can do this by counting the number of whitespace on the first line
    var i = 0;
    var numSpaces = 0;
    do{
      i++;
      if(values[i] == " "){
        numSpaces++;
      }
    }while( values[i] != '\n');
    
    // 1.916 -2.421 -4.0339 64 32 16 -0.3727 -0.2476 -0.8942
    if(numSpaces === 8){
      return 9;
    }
    
    // 1.916 -2.421 -4.0339
    if(numSpaces == 2){
      return 3;
    }
    
    var str = "";
    
    for(i = 0; i < 500; i++){
      str += values[i];
    }
    
    var str_split = str.split(/\s+/);
    var data = [];
    
    for(var i=3; i < str_split.length;){
      data.push(str_split[i++]);
      data.push(str_split[i++]);
      data.push(str_split[i++]);
      i+=3;
    }
    
    for(var i=0; i < data.length; i++){
      if(data[i] < 0 || data[i] > 255){
        normalsPresent = true;
        return 1;
      }
    }
    
    return 2;
  }
  
  /**
  */
  function createVBOs(xyz, rgb, norm){
    if(ctx){
      var o = {};
      
      var newBuffer = ctx.createBuffer();
      ctx.bindBuffer(ctx.ARRAY_BUFFER, newBuffer);
      ctx.bufferData(ctx.ARRAY_BUFFER, new WebGLFloatArray(xyz), ctx.STATIC_DRAW);
      o.posBuffer = newBuffer;
      o.id =  bufferIDCounter;
      o.size = xyz.length;
 
      if(rgb.length > 0){
        var newColBuffer = ctx.createBuffer();
        ctx.bindBuffer(ctx.ARRAY_BUFFER, newColBuffer);
        ctx.bufferData(ctx.ARRAY_BUFFER, new WebGLFloatArray(rgb), ctx.STATIC_DRAW);
        o.colBuffer = newColBuffer;
        }

      if(norm.length > 0){
        var newNormBuffer = ctx.createBuffer();
        ctx.bindBuffer(ctx.ARRAY_BUFFER, newNormBuffer);
        ctx.bufferData(ctx.ARRAY_BUFFER, new WebGLFloatArray(norm), ctx.STATIC_DRAW);
        o.normBuffer = newNormBuffer;
      }

      bufferIDCounter++;

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
  function keyCodeMap(code, shift) {
    // Letters
    if (code >= 65 && code <= 90) { // A-Z
      // Keys return ASCII for upcased letters.
      // Convert to downcase if shiftKey is not pressed.
      if (shift) {
        return code;
      }
      else {
        return code + 32;
      }
    }
    // Numbers and their shift-symbols
    else if (code >= 48 && code <= 57) { // 0-9
      if (shift) {
        switch (code) {
        case 49:
          return 33; // !
        case 50:
          return 64; // @
        case 51:
          return 35; // #
        case 52:
          return 36; // $
        case 53:
          return 37; // %
        case 54:
          return 94; // ^
        case 55:
          return 38; // &
        case 56:
          return 42; // *
        case 57:
          return 40; // (
        case 48:
          return 41; // )
        }
      }
    }
    // Coded keys
    else if (codedKeys.indexOf(code) >= 0) { // SHIFT, CONTROL, ALT, LEFT, RIGHT, UP, DOWN
      p.keyCode = code;
      return p.CODED;
    }
    // Symbols and their shift-symbols
    else {
      if (shift) {
        switch (code) {
        case 107:
          return 43; // +
        case 219:
          return 123; // {
        case 221:
          return 125; // }
        case 222:
          return 34; // "
        }
      } else {
        switch (code) {
        case 188:
          return 44; // ,
        case 109:
          return 45; // -
        case 190:
          return 46; // .
        case 191:
          return 47; // /
        case 192:
          return 96; // ~
        case 219:
          return 91; // [
        case 220:
          return 92; // \
        case 221:
          return 93; // ]
        case 222:
          return 39; // '
        }
      }
    }
    return code;
  };

  /**
  */
  var xb = {

    /**
    */
    mouseX: 0,
    mouseY: 0,
    keyDownCode: null,
    keyUpCode: null,
    keyPressCode: null,
    
    // Number of frames per seconds rendered in the last second.
    frameRate: 0,
    
    // Number of frames rendered since script started running
    frameCount: 0,
    
    width: 0,
    height: 0,

    /**
      Set the background color.
    */
    background: function(color){
      ctx.clearColor(color[0], color[1], color[2], color[3]);
    },

    /**
      Clear the color and depth buffer.
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
      
      width
      height
    */
    resize: function(width, height){
      // delete old program object?
      // delete old context?
      
      canvas.setAttribute("width", width);
      canvas.setAttribute("height", height);

      // check if style exists? how? can't just query it...
      canvas.style.width = xb.width = width;
      canvas.style.height = xb.height = height;
      
      ctx = canvas.getContext("experimental-webgl");
      ctx.viewport(0, 0, width, height);
      ctx.enable(ctx.DEPTH_TEST);
      
      xb.background(bk);
      
      progObj = createProgramObject(ctx, vertexShaderSource, fragmentShaderSource);
      ctx.useProgram(progObj);
            
      var fovy = 60;
      var aspect = width/height;
      var znear = 0.001;
      var zfar = 1000;

      var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
      var ymin = -ymax;
      var xmin = ymin * aspect;
      var xmax = ymax * aspect;

      var left = xmin;
      var right = xmax;
      var top =  ymax;
      var bottom = ymin;

      var X = 2 * znear / (right - left);
      var Y = 2 * znear / (top - bottom);
      var A = (right + left) / (right - left);
      var B = (top + bottom) / (top - bottom);
      var C = -(zfar + znear) / (zfar - znear);
      var D = -2 * zfar * znear / (zfar - znear);

      projection = M4x4.$(
      X, 0, A, 0, 
      0, Y, B, 0, 
      0, 0, C, D, 
      0, 0, -1, 0);

      view = M4x4.$(1,0,0,0,0,1,0,0,0,0,1, 0,0,0,0,1);
      model = M4x4.$(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
      normalTransform = M4x4.$(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);      
      
      // if VBOs already exist, recreate them
      if(VBOs) {
        VBOs = createVBOs(verts, cols, norms);
            
        if(cols.length > 0){
          uniformf(progObj, "lcolor", [1,1,1]);
          uniformf(progObj, "lposition", [0,0,-1]);
          uniformi(progObj, "lightCount", 1);
        }
      }
      
      uniformf(progObj, "pointSize", 1);
      uniformf(progObj, "attenuation", [attn[0], attn[1], attn[2]]);
      
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
        
        if(VBOs.colBuffer){
          vertexAttribPointer(progObj, "aColor", 3, VBOs.colBuffer);
        }
        else{
          disableVertexAttribPointer(progObj, "aColor");
        }
        
        if(VBOs.normBuffer){
          vertexAttribPointer(progObj, "aNormal", 3, VBOs.normBuffer);
          
          uniformf(progObj, "lcolor", [1,1,1]);
          uniformf(progObj, "lposition", [0,0,-1]);
          uniformi(progObj, "lightCount", 1);
        }
        else{
          disableVertexAttribPointer(progObj, "aNormal");
        }

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
      Update the cursor position everytime the mouse moves.
    */
    mouseMove: function(e){
      xb.mouseX = e.pageX;
      xb.mouseY = e.pageY;
    },
    
    /**
      element
      type
      func
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
    
      if(typeof xb.onMouseScroll === "function"){
        xb.onMouseScroll(delta);
      }
    },
    
    /**
      @private
    */
    _mousePressed: function(evt){
      if(typeof xb.onMousePressed === "function"){
        xb.onMousePressed();
      }
    },

    /**
      @private
    */    
    _mouseReleased: function(){
      if(typeof xb.onMouseReleased === "function"){
        xb.onMouseReleased();
      }
    },
    
    _keyDown: function(evt){
      keyDownCode = keyCodeMap(evt.keyCode, evt.shiftKey);
      if(typeof xb.keyDown === "function"){
        xb.keyDown();
      }
    },
    
    _keyPressed: function(evt){
      if (evt.charCode){
        keyPressCode = keyCodeMap(evt.charCode, evt.shiftKey);
      } else {
        keyPressCode = keyCodeMap(evt.keyCode, evt.shiftKey);
      }
      if(typeof xb.keyPressed === "function"){
        xb.keyPressed();
      }
    },
    
    _keyUp: function(evt){
      if(typeof xb.keyUp === "function"){
        xb.keyUp();
      }
    },
    
    /**
      cvs
      renderCB
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
      xb.attach(cvs, "keydown", xb._keyDown);
      xb.attach(cvs, "keypress", xb._keyPressed);
      xb.attach(cvs, "keyup", xb._keyUp);
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
      radians
    */
    rotateY: function(radians){
      model =  M4x4.rotate(radians,V3.$(0,1,0),model);
    },
    
    /**
      constant
      linear
      quadratic
    */
    attenuation: function(constant, linear, quadratic){
      uniformf(progObj, "attenuation", [constant, linear, quadratic]);
    },
    
    /**
      size - in pixels
    */
    pointSize: function(size){
      uniformf(progObj, "pointSize", size);
    },
    
    /**
      radians
    */
    rotateX: function(radians){
      model = M4x4.rotate(radians,V3.$(1,0,0),model);
    },
    
    /**
      radians
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
          
          var code = getDataLayout(AJAX.responseText);
          
          var normalsPresent = false;
          var colorsPresent = false;
          
          if(code == 1 ){
            code = 6;
            normalsPresent = true;
          }
          else if(code ==2 ){
            code = 6;
            colorsPresent = true;
          }
          if(code ==9){
             normalsPresent = true;
           colorsPresent = true;

          }
          
          var values = AJAX.responseText.split(/\s+/);
           
          const numVerts = values.length/code;
           
          var objCenter = [0,0,0];
           
          // xyz  rgb  normals
          for(var i = 0, len = values.length; i < len; i += code){
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

            if(colorsPresent){
              cols.push(parseInt(values[i+3])/255);
              cols.push(parseInt(values[i+4])/255);
              cols.push(parseInt(values[i+5])/255);
            }
            
            if(normalsPresent){
              norms.push(parseFloat(values[i+6]));
              norms.push(parseFloat(values[i+7]));
              norms.push(parseFloat(values[i+8]));
            }
          }
          
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
