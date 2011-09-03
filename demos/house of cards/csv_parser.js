/*
  Copyright (c) 2010  Seneca College
  MIT LICENSE

  Version:  0.1
  Author:   Andor Salga
            asalga.wordpress.com
  Date:     August 30, 2010
  
  Notes:
  This is a specific parser for Radiohead's house of cards data.
  It isn't complete in that it does not stream data, it needs to
  download the entire cloud before sending it XB PointStream for
  render.
*/

var CSV_Parser = (function() {

  /**
    Constructor
  */
  function CSV_Parser(config) {
    
    var undef;
    
    // defined once to reduce number of empty functions
    var __empty_func = function(){};
  
    var start = config.start || __empty_func;
    var parse = config.parse || __empty_func;
    var end = config.end || __empty_func;
    
    var version = "0.1";
    
    const XHR_DONE = 4;
    const STARTED = 1;
        
    var pathToFile = null;
    var fileSizeInBytes = 0;
    
    //
    var numParsedPoints = 0;
    var numTotalPoints = 0;
    var progress = 0;
    
    //
    var numValuesPerLine = -1;
    
    // keep track if onprogress event handler was called to 
    // handle Chrome/WebKit vs. Minefield differences.
    //
    // Minefield will call onprogress zero or many times
    // Chrome/WebKit will call onprogress one or many times
    var onProgressCalled = false;
    var AJAX = null;
    
    /*
      Returns the version of this parser.
      
      @returns {String} parser version.
    */
    this.__defineGetter__("version", function(){
      return version;
    });
    
    /*
      Get the number of parsed points so far.
      
      @returns {Number} number of points parsed.
    */
    this.__defineGetter__("numParsedPoints", function(){
      return numParsedPoints;
    });
    
    /*
      Get the total number of points in the point cloud.
      
      @returns {Number}
    */
    this.__defineGetter__("numTotalPoints", function(){
      return numTotalPoints;
    });
    
    /**
      Returns the progress of downloading the point cloud between zero and one.
      
      @returns {Number} value from zero to one or -1 if unknown.
    */
    this.__defineGetter__("progress", function(){
      return progress;
    });
    
    /**
      Returns the file size of the resource in bytes.
      
      @returns {Number} size of resource in bytes.
    */
    this.__defineGetter__("fileSize", function(){
      return fileSizeInBytes;
    });
    
    /**
      @param path Path to the resource
    */
    this.load = function(path){
      pathToFile = path;

      AJAX = new XMLHttpRequest();
      
      // put a reference to the parser in the AJAX object
      // so we can give the library a reference to the
      // parser within the AJAX event handler scope.
      AJAX.parser = this;

      /**
        occurs exactly once when the resource begins
        to be downloaded
      */
      AJAX.onloadstart = function(evt){
        start(AJAX.parser);
      };
            
      /*
        occurs exactly once, when the file is done 
        being downloaded
      */
      AJAX.onload = function(evt){
      
        var ascData = AJAX.responseText;
        var chunk = null;

        // if the onprogress event didn't get called--we simply got
        // the file in one go, we can parse from start to finish.
        if(onProgressCalled === false){
          chunk = ascData;
        }
        // otherwise the onprogress event was called at least once,
        // that means we need to get the data from a specific point to the end.
        else if(ascData.length - AJAX.lastNewLineIndex > 1){
          chunk = ascData.substring(AJAX.lastNewLineIndex, ascData.length);
        }

        // if the last chunk doesn't have any digits (just spaces)
        // don't parse it.
        if(chunk && chunk.match(/[0-9]/)){
          AJAX.parseChunk(chunk);
        }

        numTotalPoints = numParsedPoints;
        
        // Indicate parsing is done. ranges from 0 to 1
        progress = 1;
        
        end(AJAX.parser);
      }
      
      /**
      */
      AJAX.parseChunk = function(chunkData){
        var chunk = chunkData;
        
        // this occurs over network connections, but not locally.
        if(chunk !== ""){

          // trim trailing spaces
          chunk = chunk.replace(/\r\n/g , ",");
          numValuesPerLine = 4;

          // split
          chunk = chunk.split(/,/);
          chunk.pop();
          
         var numVerts = chunk.length/numValuesPerLine;

          numParsedPoints += numVerts;

          var verts = new Float32Array(numVerts * 3);
          var cols = new Float32Array(numVerts * 4);
          
          for(var i = 0, j = 0, len = chunk.length; i < len; i += 3, j+=4){
            verts[i]   = parseFloat(chunk[j]);
            verts[i+1] = parseFloat(chunk[j+1]);
            verts[i+2] = parseFloat(chunk[j+2]);

            cols[j] = parseFloat(chunk[j+3])/255;
          }

          // XB PointStream expects an object with named/value pairs
          // which contain the attribute arrays. These must match attribute
          // names found in the shader
          var attributes = {};
          attributes["ps_Vertex"] = verts;
          attributes["ps_Color"] = cols;
          
          parse(AJAX.parser, attributes);
        }
      };
    
      // open an asynchronous request to the path
      if(AJAX.overrideMimeType){
        AJAX.overrideMimeType("application/json");
      }
      AJAX.open("GET", path, true);
      AJAX.send(null);
    };// load
  }// ctor
  return CSV_Parser;
}());
