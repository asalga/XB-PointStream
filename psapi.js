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
    
    var matrixStack = [];
    
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
    var normalTransform;

    var progObj;
    // Keep a reference to the default program object
    // in case the user wants to unset his shaders.
    var defProgObj;
    
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

    "attribute vec3 XBPS_aVertex;" +
    "attribute vec3 XBPS_aNormal;" +
    "attribute vec4 XBPS_aColor;" +
    
    "uniform float XBPS_pointSize;" +
    "uniform vec3 XBPS_attenuation;" +
    
    "uniform mat4 XBPS_ModelViewMatrix;" +
    "uniform mat4 XBPS_Projection;" +
    
    "void main(void) {" +
    "  frontColor = XBPS_aColor;" +
    "  vec4 mvVertex = XBPS_ModelViewMatrix * vec4(XBPS_aVertex, 1.0);" +
    "  float dist = length( mvVertex );" +
    "  float attn = XBPS_attenuation[0] + " +
    "              (XBPS_attenuation[1] * dist) + " + 
    "              (XBPS_attenuation[2] * dist * dist);" +

    "  if(attn > 0.0){" +
    "    gl_PointSize = XBPS_pointSize * sqrt(1.0/attn);" +
    "  }" +
    "  else{" +
    "    gl_PointSize = 1.0;" +
    "  }"+
    
    "  gl_Position = XBPS_Projection * mvVertex;" +
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
      
      @param {Object} attributes contains name/value pairs of arrays
      { "VERTEX": [.....], "COLOR":  [.....], "NORMAL": [.....] }
    */
    function parseCallback(parser, attributes){

      var i = getParserIndex(parser);
      pointClouds[i].status = STREAMING;
      pointClouds[i].progress = parser.progress;
      pointClouds[i].numPoints = parsers[i].numParsedPoints;
      
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
      Called when the file is done being downloaded.
      
      @param {} parser
    */
    function loadedCallback(parser){

      var idx = getParserIndex(parser);
      
      // create a short alias
      var pc = pointClouds[idx];
      
      // once the point cloud is done being parsed,
      // we can merge the vbos to speed up rendering.
      var numPoints = pc.numTotalPoints = parsers[idx].numTotalPoints;
      
      // Merge the VBOs into one. Since we are slowly 
      // getting the points, we'll end up with many vbos
      // which is slow to render.
      var verts = new TYPED_ARRAY_FLOAT(numPoints * 3);
      
      var names = [];
      for(var attribute in pc.attributes){
        names.push(attribute);
      }
      
      var numVBOs = pc.attributes[names[0]].length;
      
      // iterate over all the vbos
      for(var currVBO = 0, c = 0; currVBO < numVBOs; currVBO++){
      
        // iterate over all the values in the original array and
        // copy them into a single array which will hold the entire chunk.
        for(var i = 0; i < pc.attributes[names[0]][currVBO].length; i++, c++){
          verts[c] = pc.attributes[names[0]][currVBO].array[i];
          //aOfa[c] = pc.attributes[names[c]][currVBO].array[i];
        }
      }
      
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

      matrixStack.push(M4x4.I);

      // now call user's stuff
      e.onRender();
      
      matrixStack.pop();
      
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
      X, 0, 0, 0, 
      0, Y, 0, 0, 
      A, B, C, -1, 
      0, 0, D, 0);
      
      normalTransform = M4x4.I;
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
     
      // !!
      // which check to use?
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
    
    /*************************************/
    /**********  Public methods **********/
    /*************************************/
    
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

      var names = [];

      // send in the vertex data
      for(attribute in pointCloud.attributes){
        names.push(attribute);
      }
      var name0 = names[0];
      
      var topMatrix = this.peekMatrix();
      normalTransform = M4x4.inverseOrthonormal(topMatrix);
      uniformMatrix(progObj, "XBPS_NormalMatrix", false, M4x4.transpose(normalTransform));
      uniformMatrix(progObj, "XBPS_ModelViewMatrix", false, topMatrix);
  
      // if we have a context and 
      // if the point cloud actually has something to render
      if(ctx && pointCloud.attributes[name0]){
        
        var arrayOfBufferObjs = pointCloud.attributes[name0];
        
        var numBufferObjects = arrayOfBufferObjs.length;
        
        // render all the vbos in the current point cloud
        for(var currVBO = 0; currVBO < numBufferObjects; currVBO++){
          
          for(var namesI = 0; namesI < names.length; namesI++){
            vertexAttribPointer(progObj, names[namesI], 3, pointCloud.attributes[names[namesI]][currVBO].VBO);
          }
              
          ctx.drawArrays(ctx.POINTS, 0, arrayOfBufferObjs[currVBO].length/3);
        }
      }
    };
    
    /**
    */
    this.setDefaultUniforms = function(){
      uniformf(progObj, "XBPS_pointSize", 1);
      uniformf(progObj, "XBPS_attenuation", [attn[0], attn[1], attn[2]]); 
      uniformMatrix(progObj, "XBPS_Projection", false, projection);
    }
    
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
      
      @param {Number} pWidth
      @param {Number} pHeight
    */
    this.resize = function(pWidth, pHeight){
      // override the canvas attributes
      canvas.setAttribute("width", pWidth);
      canvas.setAttribute("height", pHeight);

      // check if style exists? how? can't just query it...
      canvas.style.width = width = pWidth;
      canvas.style.height = height = pHeight;
      
      ctx = canvas.getContext("experimental-webgl");

      // parseInt hack used for Chrome/Chromium
      ctx.viewport(0, 0, parseInt(pWidth), parseInt(pHeight));
      
      runDefault();
    };
    
    /*************************************/
    /********** Transformations **********/
    /*************************************/

    /**
      1 arg = uniform scaling
      3 args = independant scaling
    */
    this.scale = function(sx, sy, sz){
      var smat = (!sy && !sz) ? M4x4.scale1(sx, M4x4.I) : 
                                M4x4.scale3(sx, sy, sz, M4x4.I);
      this.loadMatrix(M4x4.mul(this.peekMatrix(), smat));
    };
    
    /**
      Multiplies the top of the matrix stack with a translation matrix.
      
      @param {Number} tx
      @param {Number} ty
      @param {Number} tz
    */
    this.translate = function(tx, ty, tz){
      var trans = M4x4.translate3(tx, ty, tz, M4x4.I);
      this.loadMatrix(M4x4.mul(this.peekMatrix(), trans));
    };
        
    /**
      @param {Number} radians
    */
    this.rotateX = function(radians){
      var rotMat = M4x4.rotate(radians, V3.$(1,0,0), M4x4.I);
      this.loadMatrix(M4x4.mul(this.peekMatrix(), rotMat));
    };
    
    /**
      @param {Number} radians
    */
    this.rotateY = function(radians){
      var rotMat = M4x4.rotate(radians, V3.$(0,1,0), M4x4.I);
      this.loadMatrix(M4x4.mul(this.peekMatrix(), rotMat));
    };

    /**
      @param {Number} radians
    */
    this.rotateZ = function(radians){
      var rotMat = M4x4.rotate(radians, V3.$(0,0,1), M4x4.I);
      this.loadMatrix(M4x4.mul(this.peekMatrix(), rotMat));
    };
    
    /*********************************************/
    /********** Matrix Stack Operations **********/
    /*********************************************/

    /**
      Pushes on a copy of the matrix on top of the stack
    */
    this.pushMatrix = function(){
      matrixStack.push(this.peekMatrix());
    };
    
    /**
      Pops off the matrix on top of the matrix stack
    */
    this.popMatrix = function(){
      matrixStack.pop();
    };
    
    /**
      Get a copy of the matrix at the top of the matrix stack
      
      @returns {}
    */
    this.peekMatrix = function(){
      return M4x4.clone(matrixStack[matrixStack.length - 1]);
    };
        
    /**
      Set the matrix at the top of the matrix stack
      @param {} mat
    */
    this.loadMatrix = function(mat){
      matrixStack[matrixStack.length - 1] = mat;
    }
    
    /************************************/
    /********** Program Object **********/
    /************************************/

    /**
    */
    this.createProgram = function(vertShader, fragShader){
      return createProgramObject(ctx, vertShader, fragShader);
    };

    /**
    */
    this.useProgram = function(pProgObj){
      if(!pProgObj){
        progObj = defProgObj;
        ctx.useProgram(progObj);
      }
      else{
        progObj = pProgObj;
        ctx.useProgram(progObj);
      }
      this.setDefaultUniforms();
    };
    
    /**
    */
    this.uniformi = function(programObj, varName, varValue){
      uniformi(programObj, varName, varValue);
    };
    
    /**
    */
    this.uniformf = function(programObj, varName, varValue){
      uniformf(programObj, varName, varValue);
    };
    
    /**
    */
    this.uniformMatrix = function(programObj, varName, varValue){
      uniformMatrix(programObj, varName, false, varValue);
    };

    /**
    */
    this.onRender = __empty_func;
    
    /*
      Register a user's parser. When a resource is loaded with
      the extension provided by the user, the user's parser will
      be used to parse that resource.
      
      @param {String} extension
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
      
      ctx.enable(ctx.DEPTH_TEST);

      this.background(bk);
      
      // Create and use the program object
      defProgObj = progObj = createProgramObject(ctx, vertexShaderSource, fragmentShaderSource);
      ctx.useProgram(progObj);
      
      // Now that we have a program object, we can set some defaults
      this.setDefaultUniforms();
      
      // our render loop will call the users render function
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
      uniformf(progObj, "XBPS_pointSize", size);
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
        
        // !! fix (private vars are visible in user script)
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

// !! fix (re-move from global ns)
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
