/*The following is a very simple parser written only to be used as 
  an example of how a user could write a parser for XB PointStream.*/
var FOO_Parser = (function() {

  function FOO_Parser(config) {
    
    var start = config.start || function(){};
    var parse = config.parse || function(){};
    var end = config.end || function(){};
    
    var fileSizeInBytes = 0;
    var numParsedPoints = 0;
    var numTotalPoints = 0;
    var progress = 0;
       
    // keep track if onprogress event handler was called to 
    // handle Chrome/WebKit vs. Minefield differences.
    // Minefield will call onprogress zero or many times
    // Chrome/WebKit will call onprogress one or many times
    var onProgressCalled = false;
    var AJAX = null;
        
    /* Returns the version of this parser. */
    this.__defineGetter__("version", function(){return 0.1;});
    
    /* Get the number of parsed points so far. */
    this.__defineGetter__("numParsedPoints", function(){return numParsedPoints;});
    
    /* Get the total number of points in the point cloud. */
    this.__defineGetter__("numTotalPoints", function(){ return numTotalPoints;});
    
    /* Get the progress of downloading the point cloud (zero to one or -1 if unknown) */
    this.__defineGetter__("progress", function(){ return progress;});
    
    /* Returns the file size of the resource in bytes. */
    this.__defineGetter__("fileSize", function(){return fileSizeInBytes;});

    /**/
    this.load = function(path){

      AJAX = new XMLHttpRequest();      
      AJAX.parser = this;

      /*occurs exactly once, when the resource begins to be downloaded */
      AJAX.onloadstart = function(evt){
        start(AJAX.parser);
      };
            
      /*occurs exactly once, when the file is done being downloaded */
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

        AJAX.parseChunk(chunk);

        numTotalPoints = numParsedPoints;
        progress = 1;
        end(AJAX.parser);
      }

      AJAX.parseChunk = function(chunk){
        
        // this occurs over network connections, but not locally.
        if(chunk !== ""){
          // trim leading and trailing spaces
          chunk = chunk.replace(/\s+$/,"");
          chunk = chunk.replace(/^\s+/,"");
          
          // split on white space
          chunk = chunk.split(/\s+/);
          
          var numVerts = chunk.length/3;
          numParsedPoints += numVerts;
                    
          var verts = new Float32Array(numVerts * 3);

          for(var i = 0, j = 0, len = chunk.length; i < len; i += 3, j += 3){
            verts[j]   = parseFloat(chunk[i]);
            verts[j+1] = parseFloat(chunk[i+1]);
            verts[j+2] = parseFloat(chunk[i+2]);
          }
                    
          // XB PointStream expects an object with named/value pairs
          // which contain the attribute arrays. These must match attribute
          // names found in the shader
          parse(AJAX.parser, {"ps_Vertex":verts});
        }
      };
    
      /*On Minefield, this will occur zero or many times
        On Chrome/WebKit this will occur one or many times */
      AJAX.onprogress = function(evt){
      
       if(evt.lengthComputable){
          fileSizeInBytes = evt.total;
          progress = evt.loaded/evt.total;
        }

        onProgressCalled = true;

        // if we have something to actually parse
        if(AJAX.responseText){
          var ascData = AJAX.responseText;

          // likely stopped getting data in the middle of a line in the file:
          // 1.079 1.296 9.360 0 0 0 4.307 1.181 5.208\n
          // 3.163 2.225 6.139 0 0 0 0.6<-- stopped here
          
          // So find the last known newline. Everything from the last
          // request to this last newline can be placed in a buffer.
          var lastNewLineIndex = ascData.lastIndexOf("\n");
          AJAX.lastNewLineIndex = lastNewLineIndex;
          
          // if the status just changed and we finished downloading the
          // file, grab everyting until the end. If there is only a bunch
          // of whitespace, make a note of that and don't bother parsing.
          if(AJAX.readyState === 4){
            var chunk = ascData.substring(AJAX.startOfNextChunk, ascData.length);
            AJAX.parseChunk(chunk);
          }
          // if we still have more data to go
          else{
            // Start of the next chunk starts after the newline.
            var chunk = ascData.substring(AJAX.startOfNextChunk, lastNewLineIndex + 1);
            AJAX.startOfNextChunk = lastNewLineIndex + 1;
            AJAX.parseChunk(chunk);
          }
        }
      };
      
      AJAX.open("GET", path, true);
      AJAX.send(null);
    };
  }
  return FOO_Parser;
}());
