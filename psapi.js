/*
  Copyright (c) 2010  Seneca College
  MIT LICENSE
*/

var PointStream = (function() {

  /**
    Constructor
  */
  function PointStream() {
    
    // intentionally left undefined
    var undef;
    
    var __empty_func = function(){};
    
    // mouse events
    var userMouseReleased = __empty_func;
    var userMousePressed = __empty_func;
    
    // !! change to scrolled?
    var userMouseScroll = __empty_func;
    var mouseX = 0;
    var mouseY = 0;
    
    // keyboard
    var userKeyUp = __empty_func;
    var userKeyDown = __empty_func;
    var userKeyPressed = __empty_func;
    
    // These are parallel arrays. Each parser
    // has a point cloud it works with
    var parsers = [];
    var pointClouds = [];
    
    var registeredParsers = {};
    registeredParsers["asc"] = ASCParser;
    //registeredParsers["psi"] = PSIParser;
      
    // WebGL compatibility wrapper
    try{
      Float32Array;
    }catch(ex){
      Float32Array = WebGLFloatArray;
      Uint8Array = WebGLUnsignedByteArray;
    }
    const TYPED_ARRAY_FLOAT = Float32Array;
    const TYPED_ARRAY_BYTE = Uint8Array;

    const XBPS_VERSION  = "0.4.5";
    
    // file status of point clouds
    const FILE_NOT_FOUND = -1;
    const STARTED = 1;
    const STREAMING = 2;
    const COMPLETE = 3;
      
    // for calculating fps
    var frames = 0;
    var frameRate = 0;
    var lastTime;
    
    // default rendering states
    var bk = [1, 1, 1, 1];
    var attn = [0.01, 0.0, 0.003];
    
    // tinylogLite
    var logBuffer = [];
      
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
    
    var canvas = null;
    var ctx = null;

    // shader matrices
    var projection;
    var view;
    var model;
    var normalTransform;

<<<<<<< .merge_file_7nnFRB
    var progObj;
    
    // Both key and keyCode will be equal to these values
    const _BACKSPACE = 8;
    const _TAB       = 9;
    const _ENTER     = 10;
    const _RETURN    = 13;
    const _ESC       = 27;
    const _DELETE    = 127;
    const _CODED     = 0xffff;

    // p.key will be CODED and p.keyCode will be this value
    const _SHIFT     = 16;
    const _CONTROL   = 17;
    const _ALT       = 18;
    const _UP        = 38;
    const _RIGHT     = 39;
    const _DOWN      = 40;
    const _LEFT      = 37;

    var codedKeys = [_SHIFT, _CONTROL, _ALT, _UP, _RIGHT, _DOWN, _LEFT];
    
    var vertexShaderSource =
    "varying vec4 frontColor;" +
    "attribute vec3 aVertex;" +
    "attribute vec3 aNormal;" +
    "attribute vec4 aColor;" +
    
    "uniform bool colorsPresent;" +

    "uniform bool usingMat;" +
    "uniform vec3 specular;" +
    "uniform vec3 mat_emissive;" +
    "uniform vec3 mat_ambient;" +
    "uniform vec3 mat_specular;" +
    "uniform float shininess;" +
    
    "uniform float pointSize;" +
    "uniform vec3 attenuation;" +
    
    "uniform mat4 model;" +
    "uniform mat4 view;" +
    "uniform mat4 projection;" +
    "uniform mat4 normalTransform;" +

    "struct LightStruct{" +
    "  vec3 col;" + 
    "  vec3 pos;" +
    "};" +
    "uniform LightStruct light;" +

    "uniform int lightCount;" +

    "void DirectionalLight( inout vec3 col, in vec3 ecPos, in vec3 vertNormal ) {" +
    "  float nDotVP = max(0.0, dot( vertNormal, light.pos ));" +
    "  float nDotVH = max(0.0, dot( vertNormal, normalize( light.pos-ecPos )));" +
    "  col += light.col * 2.0 * nDotVP;" +
    "}" +

    "void PointLight( inout vec3 col, in vec3 ecPos, in vec3 vertNormal, in vec3 eye ) {" +
    // Get the vector from the light to the vertex
    "   vec3 VP = light.pos - ecPos;" +

    // Get the distance from the current vector to the light position
    "  float d = length( VP ); " +

    // Normalize the light ray so it can be used in the dot product operation.
    "  VP = normalize( VP );" +

    "  float attenuation = 1.0 / ( 1.0 + ( d ) + ( d * d ));" +
    "  float nDotVP = max( 0.0, dot( vertNormal, VP ));" +
    "  vec3 halfVector = normalize( VP + eye );" +
    "  float nDotHV = max( 0.0, dot( vertNormal, halfVector ));" +
    "  col += light.col * nDotVP;" +
    "}" +

    "void main(void) {" +
    "  vec3 finalDiffuse = vec3( 0.0, 0.0, 0.0 );" +

    // If no color data is present, use 1's so normals get lit.
    "  vec4 col = aColor;" +
    "  if(colorsPresent == false){" +
    "    col = vec4(1.0, 1.0, 1.0, 1.0);" +
    "  }" +
    
    "  vec3 norm = vec3( normalTransform * vec4( aNormal, 0.0 ) );" +

    "  vec4 ecPos4 = view * model * vec4(aVertex,1.0);" +
    "  vec3 ecPos = (vec3(ecPos4))/ecPos4.w;" +
    "  vec3 eye = vec3( 0.0, 0.0, 1.0 );" +

    // If there were no lights this draw call, just use the
    // assigned fill color of the shape and the specular value
    "  if( lightCount == 0 ) {" +
    "    frontColor = vec4(col[0], col[1], col[2], 1.0);" +
    "  }" +
    "  else {" +
    "    PointLight(finalDiffuse, ecPos, norm, eye );" +
    "    frontColor = vec4(finalDiffuse[0] * col[0], finalDiffuse[1] * col[1], finalDiffuse[2] * col[2], 1.0);" +
    "  }" +

    "  float dist = length( view * model * vec4(aVertex, 1.0));" +
    "  float attn = attenuation[0] + (attenuation[1] * dist) + (attenuation[2] * dist * dist);" +

    "  if(attn > 0.0){" +
    "    gl_PointSize = pointSize * sqrt(1.0/attn);" +
    "  }" +
    "  else{" +
    "    gl_PointSize = 1.0;" +
    "  }"+
    
    "  gl_Position = projection * view * model * vec4(aVertex, 1.0);" +
    "}";

    var fragmentShaderSource =
    "#ifdef GL_ES\n" +
    "precision highp float;\n" +
    "#endif\n" +
    
    "varying vec4 frontColor;" +
    "void main(void){" +
    "  gl_FragColor = frontColor;" +
    "}";

    /**
      set a uniform integer
      @param programObj
      @param {String} varName
      @param varValue
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
      Set a uniform float
      @param programObj
      @param {String} varName
      @param varValue
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
      !! fix this
    */
    function getParserIndex(parser){
      var i;
      for(i = 0; i < parsers.length; i++){
        if(parsers[i] === parser){break;}
      }
      return i;
    }
    
    /*
      Create a buffer object which will contain
      the Vertex buffer object for the shader along
      with a reference to the original array
      
      A 3D context must exist before calling this function
      
      @param {Array} arr
    */
    function createBufferObject(arr){
    
      // !! add check for length > 0
      if(ctx){
        var VBO = ctx.createBuffer();
        ctx.bindBuffer(ctx.ARRAY_BUFFER, VBO);
        ctx.bufferData(ctx.ARRAY_BUFFER, arr, ctx.STATIC_DRAW);
        
        // length is simply for convenience
        var obj = {
          length: arr.length,
          VBO: VBO,
          array: arr
        }
        
        return obj;
      }
    }
    
    /**
      @param {} programObj
      @param {String} varName
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
      Sets a uniform matrix
      @param {} programObj
      @param {String} varName
      @param {} transpose - must be false
      @param {Array} matrix
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
    function createProgramObject(ctx, vetexShaderSource, fragmentShaderSource) {
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
      Used by keyboard event handlers
      @param {} code
      @param {} shift
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
    }
    
    /**
      @param {} evt
      @param {} type
    */
    function keyFunc(evt, type){
      if (evt.charCode){
        key = keyCodeMap(evt.charCode, evt.shiftKey);
      } else {
        key = keyCodeMap(evt.keyCode, evt.shiftKey);
      }
      type();
    }

    // tinylog lite JavaScript library
    // http://purl.eligrey.com/tinylog/lite
    /*global tinylog,print*/
    var tinylogLite = (function() {
      "use strict";

      var tinylogLite = {},
        undef = "undefined",
        func = "function",
        False = !1,
        True = !0,
        logLimit = 512,
        log = "log";

      if (typeof tinylog !== undef && typeof tinylog[log] === func) {
        // pre-existing tinylog present
        tinylogLite[log] = tinylog[log];
      } else if (typeof document !== undef && !document.fake) {
        (function() {
          // DOM document
          var doc = document,

          $div = "div",
          $style = "style",
          $title = "title",

          containerStyles = {
            zIndex: 10000,
            position: "fixed",
            bottom: "0px",
            width: "100%",
            height: "15%",
            fontFamily: "sans-serif",
            color: "#ccc",
            backgroundColor: "black"
          },
          outputStyles = {
            position: "relative",
            fontFamily: "monospace",
            overflow: "auto",
            height: "100%",
            paddingTop: "5px"
          },
          resizerStyles = {
            height: "5px",
            marginTop: "-5px",
            cursor: "n-resize",
            backgroundColor: "darkgrey"
          },
          closeButtonStyles = {
            position: "absolute",
            top: "5px",
            right: "20px",
            color: "#111",
            MozBorderRadius: "4px",
            webkitBorderRadius: "4px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "normal",
            textAlign: "center",
            padding: "3px 5px",
            backgroundColor: "#333",
            fontSize: "12px"
          },
          entryStyles = {
            //borderBottom: "1px solid #d3d3d3",
            minHeight: "16px"
          },
          entryTextStyles = {
            fontSize: "12px",
            margin: "0 8px 0 8px",
            maxWidth: "100%",
            whiteSpace: "pre-wrap",
            overflow: "auto"
          },

          view = doc.defaultView,
            docElem = doc.documentElement,
            docElemStyle = docElem[$style],

          setStyles = function() {
            var i = arguments.length,
              elemStyle, styles, style;

            while (i--) {
              styles = arguments[i--];
              elemStyle = arguments[i][$style];

              for (style in styles) {
                if (styles.hasOwnProperty(style)) {
                  elemStyle[style] = styles[style];
                }
              }
            }
          },

          observer = function(obj, event, handler) {
            if (obj.addEventListener) {
              obj.addEventListener(event, handler, False);
            } else if (obj.attachEvent) {
              obj.attachEvent("on" + event, handler);
            }
            return [obj, event, handler];
          },
          unobserve = function(obj, event, handler) {
            if (obj.removeEventListener) {
              obj.removeEventListener(event, handler, False);
            } else if (obj.detachEvent) {
              obj.detachEvent("on" + event, handler);
            }
          },
          clearChildren = function(node) {
            var children = node.childNodes,
              child = children.length;

            while (child--) {
              node.removeChild(children.item(0));
            }
          },
          append = function(to, elem) {
            return to.appendChild(elem);
          },
          createElement = function(localName) {
            return doc.createElement(localName);
          },
          createTextNode = function(text) {
            return doc.createTextNode(text);
          },

          createLog = tinylogLite[log] = function(message) {
            // don't show output log until called once
            var uninit,
              originalPadding = docElemStyle.paddingBottom,
              container = createElement($div),
              containerStyle = container[$style],
              resizer = append(container, createElement($div)),
              output = append(container, createElement($div)),
              closeButton = append(container, createElement($div)),
              resizingLog = False,
              previousHeight = False,
              previousScrollTop = False,
              messages = 0,

              updateSafetyMargin = function() {
                // have a blank space large enough to fit the output box at the page bottom
                docElemStyle.paddingBottom = container.clientHeight + "px";
              },
              setContainerHeight = function(height) {
                var viewHeight = view.innerHeight,
                  resizerHeight = resizer.clientHeight;

                // constrain the container inside the viewport's dimensions
                if (height < 0) {
                  height = 0;
                } else if (height + resizerHeight > viewHeight) {
                  height = viewHeight - resizerHeight;
                }

                containerStyle.height = height / viewHeight * 100 + "%";

                updateSafetyMargin();
              },
              observers = [
                observer(doc, "mousemove", function(evt) {
                  if (resizingLog) {
                    setContainerHeight(view.innerHeight - evt.clientY);
                    output.scrollTop = previousScrollTop;
                  }
                }),

                observer(doc, "mouseup", function() {
                  if (resizingLog) {
                    resizingLog = previousScrollTop = False;
                  }
                }),

                observer(resizer, "dblclick", function(evt) {
                  evt.preventDefault();

                  if (previousHeight) {
                    setContainerHeight(previousHeight);
                    previousHeight = False;
                  } else {
                    previousHeight = container.clientHeight;
                    containerStyle.height = "0px";
                  }
                }),

                observer(resizer, "mousedown", function(evt) {
                  evt.preventDefault();
                  resizingLog = True;
                  previousScrollTop = output.scrollTop;
                }),

                observer(resizer, "contextmenu", function() {
                  resizingLog = False;
                }),

                observer(closeButton, "click", function() {
                  uninit();
                })
              ];

            uninit = function() {
              // remove observers
              var i = observers.length;

              while (i--) {
                unobserve.apply(tinylogLite, observers[i]);
              }

              // remove tinylog lite from the DOM
              docElem.removeChild(container);
              docElemStyle.paddingBottom = originalPadding;

              clearChildren(output);
              clearChildren(container);

              tinylogLite[log] = createLog;
            };

            setStyles(
            container, containerStyles, output, outputStyles, resizer, resizerStyles, closeButton, closeButtonStyles);

            closeButton[$title] = "Close Log";
            append(closeButton, createTextNode("\u2716"));

            resizer[$title] = "Double-click to toggle log minimization";

            docElem.insertBefore(container, docElem.firstChild);

            tinylogLite[log] = function(message) {
              if (messages === logLimit) {
                output.removeChild(output.firstChild);
              } else {
                messages++;
              }
              
              var entry = append(output, createElement($div)),
                entryText = append(entry, createElement($div));

              entry[$title] = (new Date()).toLocaleTimeString();

              setStyles(
              entry, entryStyles, entryText, entryTextStyles);

              append(entryText, createTextNode(message));
              output.scrollTop = output.scrollHeight;
            };

            tinylogLite[log](message);
          };
        }());
      } else if (typeof print === func) { // JS shell
        tinylogLite[log] = print;
      }

      return tinylogLite;
    }());    
    
    /**
    */
    function startCallback(parser){
      var i = getParserIndex(parser);
      pointClouds[i].status = STARTED;
    }
    
    /*
      Whenever a chunk of data is parsed, this function 
      will be called.
      
      sends in name value pairs
      {
        "VERTEX" : [.....],
        "COLOR" :  [.....],
        "UNKNOWN": [.....]
      }
    */
    function parseCallback(attributes, parser){

      var i = getParserIndex(parser);
      pointClouds[i].status = STREAMING;
      pointClouds[i].progress = parser.progress;
      pointClouds[i].numPoints = parsers[i].numParsedPoints;
      
      // !! comment
      for(var semantic in attributes){
      
       // if not yet created  
       if(!pointClouds[i].attributes[semantic]){
          pointClouds[i].attributes[semantic] = [];
        }
        
        var buffObj = createBufferObject(attributes[semantic]);
        pointClouds[i].attributes[semantic].push(buffObj);
      }
    }
        
    /*
      called when the file is done being downloaded
      
      // !! this function needs some serious documentation
    */
    function loadedCallback(parser){

      var idx = getParserIndex(parser);
      
      // create a short alias
      var pc = pointClouds[idx];
      
      // once the point cloud is done being parsed,
      // we can merge the vbos    
      var numPoints = pc.numTotalPoints = parsers[idx].numTotalPoints;
      
      // Merge the VBOs into one. Since we are slowly 
      // getting the points, we'll end up with many vbos
      // which is slow to render.
      var verts = new TYPED_ARRAY_FLOAT(numPoints * 3);
      var cols = null;
      var norms = null;
      
      //
      if(pc.attributes["COLOR"]){
        cols = new TYPED_ARRAY_FLOAT(numPoints * 3);
      }
      if(pc.attributes["NORMAL"]){
        norms = new TYPED_ARRAY_FLOAT(numPoints * 3);
      }
      
      var numVBOs = pc.attributes["VERTEX"].length;
      
      //
      //
      // iterate over all the vbos
      for(var currVBO = 0, c = 0; currVBO < numVBOs; currVBO++){
      
        // iterate over all the values in the original array and
        // copy them into a single array which will hold the entire chunk.
        for(var i = 0; i < pc.attributes["VERTEX"][currVBO].length; i++, c++){
          
          verts[c] = pc.attributes["VERTEX"][currVBO].array[i];
          
          if(cols){
            cols[c] = pc.attributes["COLOR"][currVBO].array[i];
          }
          if(norms){
            norms[c] = pc.attributes["NORMAL"][currVBO].array[i];
          }
        }
      }
      
      // rendering code iterates over all the vbos, so
      // make sure we have an array of just one element
      // !! eventually fix this
      /*pc.attributes["VERTEX"] = [];
      pc.attributes["VERTEX"].push(createBufferObject(verts));

      if(cols){
        pc.attributes["COLOR"] = [];
        pc.attributes["COLOR"].push(createBufferObject(cols));
      }

      if(norms){
        pc.attributes["NORMAL"] = [];
        pc.attributes["NORMAL"].push(createBufferObject(norms));
      }*/
      
      // !! fix
      pc.center = getAverage(verts);
      
      pc.status = COMPLETE;
      pc.progress = parser.progress;
    }
    
    /**
    */
    this.background = function(color){
      ctx.clearColor(color[0], color[1], color[2], color[3]);
    }
    
    /**
      @param {} e
    */
    function renderLoop(e){
      frames++;
      var now = new Date();

      // now call user's stuff
      e.onRender();

      // our stuff
      model = M4x4.$(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
      
      // if more than 1 second has elapsed, recalculate fps
      if(now - lastTime > 1000){
        frameRate = frames/(now-lastTime)*1000;
        frames = 0;
        lastTime = now;
      }
    }
    
    /**
      Sets variables to default values.
    */
    function runDefault(){
      var fovy = 60;
      
      //alert(this.width);
      var aspect = width/height;
      var znear = 0.1;

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
      
      // !! fix this identity
      view =            M4x4.$(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
      model =           M4x4.$(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
      normalTransform = M4x4.$(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1);
    };
    
    /**
      @param {} element
      @param {} type
      @param {Function} func
    */
    function attach(element, type, func){
      //
      if(element.addEventListener){
        element.addEventListener(type, func, false);
      } else {
        element.attachEvent("on" + type, fn);
      }
    }
    
    function mouseScroll(evt){
      var delta = 0;
     
      // which check to use?
      // !!!
      //if(browser === MINEFIELD){
      if(evt.detail){
        delta = evt.detail / 3;
      }
      else if(evt.wheelDelta){
        delta = -evt.wheelDelta / 360;
      }
      userMouseScroll(delta);
    }
    
    function mousePressed(){
      userMousePressed();
    }
    
    function mouseReleased(){
      userMouseReleased();
    }
    
    function mouseMoved(evt){
      mouseX = evt.pageX;
      mouseY = evt.pageY;
    }
    
    function keyDown(evt){
      keyFunc(evt, userKeyDown);
    }
    
    function keyPressed(evt){
      keyFunc(evt, userKeyPressed);
    }
    
    function keyUp(evt){
      keyFunc(evt, userKeyUp);
    }
    
    /****************************************/
    /*********  Public methods **************/
    /****************************************/
    
    /**
    */
    this.__defineSetter__("onMousePressed", function(func){
      userMousePressed = func;
    });
    
    /**
    */
    this.__defineSetter__("onMouseReleased", function(func){
      userMouseReleased = func;
    });
    
    /**
    */
    this.__defineSetter__("onMouseScroll", function(func){
      userMouseScroll = func;
    });
    
    /**
    */
    this.__defineSetter__("onKeyDown", function(func){
      userKeyDown = func;
    });
    
    /**
    */
    this.__defineSetter__("onKeyPressed", function(func){
      userKeyPressed = func;
    });
    
    /**
    */
    this.__defineSetter__("onKeyUp", function(func){
      userKeyUp = func;
    });
    
    this.__defineGetter__("mouseX", function(){
      return mouseX;
    });
    
    this.__defineGetter__("mouseY", function(){
      return mouseY;
    });

    this.__defineGetter__("width", function(){
      return mouseY;
    });

    this.__defineGetter__("height", function(){
      return height;
    });
        
    /**
    */
    this.clear = function(){
      ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
    };
    
    /**
      Get the version of the library.
      @returns {String} library version
    */
    this.getVersion = function(){
      return XBPS_VERSION;
    };
    
    /**
      Renders a point cloud
      @param {} pointCloud
    */
    this.render = function(pointCloud){

      // if we have a context and 
      // if the point cloud actually has something to render
      if(ctx && pointCloud.attributes["VERTEX"]){
        
        var arrayOfBufferObjs = pointCloud.attributes["VERTEX"];
        
        var numBufferObjects = arrayOfBufferObjs.length;

        // render all the vbos in the current point cloud
        for(var currVBO = 0; currVBO < numBufferObjects; currVBO++){
        
          // send in the vertex data
          vertexAttribPointer(progObj, "aVertex", 3, arrayOfBufferObjs[currVBO].VBO);
          
          // if we have a color attribute, send in those values
          if(pointCloud.attributes["COLOR"]){
            vertexAttribPointer(progObj, "aColor", 3, pointCloud.attributes["COLOR"][currVBO].VBO);
            uniformi(progObj, "colorsPresent", true);
          }
          else{
            disableVertexAttribPointer(progObj, "aColor");
            uniformi(progObj, "colorsPresent", false);
          }
          
          // only turn on the lights if we have normal data
          if(pointCloud.attributes["NORMAL"]){
            vertexAttribPointer(progObj, "aNormal", 3, pointCloud.attributes["NORMAL"][currVBO].VBO);
            uniformf(progObj, "light.col", [1, 1, 1]);
            uniformf(progObj, "light.pos", [0, 0, -1]);
            uniformi(progObj, "lightCount", 1);
          }
          else{
            disableVertexAttribPointer(progObj, "aNormal");
            uniformi(progObj, "lightCount", 0);
          }

          var mvm = M4x4.mul(view, model);
          normalTransform = M4x4.inverseOrthonormal(mvm);
          uniformMatrix(progObj, "normalTransform", false, M4x4.transpose(normalTransform));
          uniformMatrix(progObj, "model", false, model);
          
          //alert(pointCloud.attributes["VERTEX"][0].length/3);
          
          ctx.drawArrays(ctx.POINTS, 0, arrayOfBufferObjs[currVBO].length/3);
        }
      }
    };
    
    /**
      Get the version of the library.
      
      @returns {String} library version
    */
    this.__defineGetter__("version", function(){
      return XBPS_VERSION;
    });
    
    /**
    */
    this.__defineGetter__("frameRate", function(){
      return frameRate;
    });
        
    /**
      Resize the viewport.
      This can be called after setup
      
      @param {Number} width
      @param {Number} height
    */
    this.resize = function(wi, he){
      // delete old program object?
      // delete old context?
      
      // override the canvas attributes
      canvas.setAttribute("width", wi);
      canvas.setAttribute("height", he);

      // check if style exists? how? can't just query it...
      canvas.style.width = width = wi;
      canvas.style.height = height = he;
      
      ctx = canvas.getContext("experimental-webgl");

      // crazy hack for Chrome/Chromium
      var w = parseInt(wi);
      var h = parseInt(he);
      
      ctx.viewport(0, 0, w, h);
      ctx.enable(ctx.DEPTH_TEST);
      
      this.background(bk);
      
      progObj = createProgramObject(ctx, vertexShaderSource, fragmentShaderSource);
      ctx.useProgram(progObj);
      
      runDefault();      
      
      // if VBOs already exist, recreate them?

      // !! check if point cloud vbo exists?          
      uniformf(progObj, "light.pos", [0,0,-1]);
      uniformf(progObj, "light.col", [1,1,1]);
      uniformi(progObj, "lightCount", 1);
      
      uniformf(progObj, "pointSize", 1);
      uniformf(progObj, "attenuation", [attn[0], attn[1], attn[2]]); 

      uniformMatrix(progObj, "view", false, M4x4.transpose(view));
      uniformMatrix(progObj, "projection", false, M4x4.transpose(projection));
    };


////////////

    /**
      @private
    */    
    _mouseReleased: function(){
      if(typeof xb.onMouseReleased === "function"){
        xb.onMouseReleased();
      }
    },
    
    _keyDown: function(evt){
      if(typeof xb.keyDown === "function"){
        xb.key = keyFunc(evt, xb.keyDown);
        xb.keyDown();
      }
    },
    
    _keyPressed: function(evt){
      if(typeof xb.keyPressed === "function"){
        xb.key = keyFunc(evt, xb.keyPressed);
        xb.keyPressed();
      }
    },
    
    _keyUp: function(evt){
      if(typeof xb.keyUp === "function"){
        xb.key = keyFunc(evt, xb.keyUp);
        xb.keyUp();
      }
    },
    
    /**
    */
    this.onRender = __empty_func;
    
    /*
      Register a user's parser. When a resource is loaded with
      the extension provided by the user, the user's parser will
      be used to parse that resource.
      
      @param {String} str
      @param {} usersParser
    */
    this.registerParser = function(extension, usersParser){
      registeredParsers[extension] = usersParser;
    };

    console: window.console || tinylogLite;

    /**
      prints a line to the console
      @param {String} message
    */
    this.println = function(message) {
      var bufferLen = logBuffer.length;
      if (bufferLen) {
        tinylogLite.log(logBuffer.join(""));
        logBuffer.length = 0; // clear log buffer
      }

      if (arguments.length === 0 && bufferLen === 0) {
        tinylogLite.log("");
      } else if (arguments.length !== 0) {
        tinylogLite.log(message);
      }
    };

    /**
      Prints a message
      @param {String} message
    */
    this.print = function(message) {
      logBuffer.push(message);
    };

    /**
      Must be called after the library has been created.
      
      @param {canvas} cvs
    */
    this.setup = function(cvs){
      canvas = cvs;
      //browser = getUserAgent(navigator.userAgent);
      
      lastTime = new Date();
      frames = 0;
      
      this.resize(canvas.getAttribute("width"), canvas.getAttribute("height"));
      
      // our render loop will call the users render function.
      setInterval(renderLoop, 10, this);

      attach(cvs, "mouseup", mouseReleased);
      attach(cvs, "mousedown", mousePressed);
      attach(cvs, "DOMMouseScroll", mouseScroll);
      attach(cvs, "mousewheel", mouseScroll);
      
      attach(cvs, "mousemove", mouseMoved);
      
      attach(document, "keydown", keyDown);
      attach(document, "keypress", keyPressed);
      attach(document, "keyup", keyUp);
    };


    /**
      1 arg = uniform scaling
      3 args = independant scaling
    */
    this.scale = function(sx, sy, sz){
    
      // uniform scaling
      if( !sy && !sz){
        model =  M4x4.scale1(sx, model);
      }
      else{
        model =  M4x4.scale3(sx, sy, sz, model);
      }
    };
    
    /**
     @param {Number} tx
     @param {Number} ty
     @param {Number} tz
    */
    this.translate = function(tx, ty, tz){
      model = M4x4.translate3(tx, ty, tz, model, model);
    };
    
    /**
      @param {Number} radians
    */
    this.rotateY = function(radians){
      model =  M4x4.rotate(radians,V3.$(0,1,0),model);
    };
    
    /**
      @param {Number} constant - 
      @param {Number} linear -   
      @param {Number} quadratic - 
    */
    this.attenuation = function(constant, linear, quadratic){
      uniformf(progObj, "attenuation", [constant, linear, quadratic]);
    };
    
    /**
      @param {Number} size - in pixels
      
      !! change to get/setter
    */
    this.pointSize = function(size){
      uniformf(progObj, "pointSize", size);
    };
    
    /**
      @param {Number} radians
    */
    this.rotateX = function(radians){
      model = M4x4.rotate(radians,V3.$(1,0,0),model);
    };
    
    /**
      @param {Number} radians
    */
    this.rotateZ = function(radians){
      model = M4x4.rotate(radians,V3.$(0,0,1),model);
    };
        
    /**
      @param {String} path - path to resource
    */
    this.load = function(path){

      // get the extension of the resource
      var extension = path.split(".").pop().toLowerCase();
      
      if(registeredParsers[extension]){
      
        var parserObject = registeredParsers[extension];

        var parser = new parserObject({ start: startCallback,
                                        parse: parseCallback,
                                        end: loadedCallback});
        
        // !! fix
        var newPointCloud = {

          VBOs: [],
          attributes: {},
          
          progress: 0,
          getProgress: function(){
            return this.progress;
          },
          
          status: -1,
          getStatus: function(){
            return this.status;
          },
          
          center: [0, 0, 0],
          getCenter: function(){
            return this.center;
          },
          
          numTotalPoints: -1,
          getNumTotalPoints: function(){
            return this.numTotalPoints;
          },
          
          numPoints: -1,
          getNumPoints: function(){
            return this.numPoints;
          }
        };
        
        parsers.push(parser);
        pointClouds.push(newPointCloud);
        
        parser.load(path);
        
        return newPointCloud;
      }
      
      throw "There is no parser for the file type: " + extension;
      
      return null;
    }
  }// constructor

  return PointStream;
}());

// !! fix
var getAverage = function(arr){
  var objCenter = [0, 0, 0];

  for(var i = 0; i < arr.length; i += 3){
    objCenter[0] += arr[i];
    objCenter[1] += arr[i+1];
    objCenter[2] += arr[i+2];
  }

  objCenter[0] /= arr.length/3;
  objCenter[1] /= arr.length/3;
  objCenter[2] /= arr.length/3;
  
  return objCenter;
}
