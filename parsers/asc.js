/*
  Copyright (c) 2010  Seneca College
  MIT LICENSE

  Version:  0.1
  Author:   Andor Salga
            asalga.wordpress.com
  Date:     November 16, 2010
  
  Notes:
  This parser parses .ASC filetypes. These files are ASCII
  files which have their data stored in one of the following ways:

  X, Y, Z
  X, Y, Z, R,  G,  B
  X, Y, Z, NX, NY, NZ
  X, Y, Z, R,  G,  B, NX, NY, NZ
*/

var ASCParser = (function() {

  /**
    Constructor
  */
  function ASCParser() {
  
    const UNKNOWN = -1;
    
    const XHR_DONE = 4;
    const STARTED = 1;
    
    // start callback
    var parseCallback = null;
    var loadedCallback = null;
    
    var pathToFile = null;
    var fileSize = 0;
    
    //
    var numParsedPoints = 0;
    var numTotalPoints = 0;
    
    //
    var numValuesPerLine = -1;
    var normalsPresent = false;
    var colorsPresent = false;
    var layoutCode = UNKNOWN;
    
    //
    var parsedVerts = [];
    var parsedCols = [];
    var parsedNorms = [];
    
    // keep track if onprogress event handler
    // was called to handle Chrome/Minefield differences.
    var onProgressCalled = false;
    var AJAX = null;
    
    // WebGL compatibility wrapper
    try{
      Float32Array;
    }catch(ex){
      Float32Array = WebGLFloatArray;
    }
    
    /**
      @private
      
      ASC files can either contain
      X, Y, Z
      X, Y, Z, R,  G,  B
      X, Y, Z, NX, NY, NZ
      X, Y, Z, R,  G,  B, NX, NY, NZ
      
      @Returns
      0 first case
      1 second case
      2 third case
      3 fourth case
    */
    var getDataLayout = function(values){
      var normalsPresent = false;
      var colorsPresent = false;
      
      var VERTS = 0;
      var VERTS_COLS = 1;
      var VERTS_NORMS = 2;
      var VERTS_COLS_NORMS = 3;
      
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
      }while(values[i] != '\n');
      
      // Vertices, Colors, Normals:
      // 1.916 -2.421 -4.0   64 32 16   -0.3727 -0.2476 -0.8942
      if(numSpaces === 8){
        return VERTS_COLS_NORMS;
      }
      
      // Just vertices:
      // 1.916 -2.421 -4.0339
      if(numSpaces == 2){
        return VERTS;
      }
      
      var str = "";
      
      //
      //
      for(i = 0; i < 500; i++){
        str += values[i];
      }
      
      var str_split = str.split(/\s+/);
      var data = [];
      
      for(var i = 3; i < str_split.length;){
        data.push(str_split[i++]);
        data.push(str_split[i++]);
        data.push(str_split[i++]);
        i+=3;
      }
      
      for(var i = 0; i < data.length; i++){
        if(data[i] < 0 || data[i] > 255){
          normalsPresent = true;
          return VERTS_NORMS;
        }
      }
      
      // Vertices and Normals:
      // 1.916 -2.421 -4.0   -0.3727 -0.2476 -0.8942
      return VERTS_COLS;
    };
    
    /*
      Returns the version of this parser
      
      @returns String
    */
    this.getVersion = function(){
      return "0.1";
    };
    
    /**
    */
    this.setParseCallback = function(){
      parseCallback = arguments[0];
    };
    
    /*
    */
    this.setLoadedCallback = function(){
      loadedCallback = arguments[0];
    };
    
    /*
    */
    this.getNumParsedPoints = function(){
      return numParsedPoints;
    };
    
    /*
    */
    this.getNumTotalPoints = function(){
      return numTotalPoints;
    }
    
    /*
    */
    this.getFileSize = function(){
      return fileSize;
    };

    
    /**
      pathToFile
    */
    this.load = function(path){
      pathToFile = path;

      // !!
      AJAX = new XMLHttpRequest();
      var str = "";
      for(var i in AJAX){
        str += i + "\n";
      }
      
      // !! comment
      AJAX.parser = this;

      /**
      */
      AJAX.onloadstart = function(evt){
        if(evt.lengthComputable){
          fileSize = evt.total;
        }
      };
            
      // this function is called once, when the file is 
      // done being downloaded.
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
        loadedCallback(AJAX.parser);
      }
      
      //
      AJAX.parseChunk = function(chunkData){
        var chunk = chunkData;
        
        // !! fix this
        if(layoutCode === UNKNOWN){
          layoutCode = getDataLayout(chunk);
          numValuesPerLine = -1;
          
          switch(layoutCode){
            case 0: numValuesPerLine = 3;
                    break;
            case 1: numValuesPerLine = 6;
                    colorsPresent = true;
                    break;
            case 2: numValuesPerLine = 6;
                    normalsPresent = true;
                    break;
            case 3: numValuesPerLine = 9;
                    normalsPresent = true;
                    colorsPresent = true;
                    break;
          }
          gotLayout = true;
        }
        
        // trim trailing spaces
        chunk = chunk.replace(/\s+$/,"");
        
        // trim leading spaces
        chunk = chunk.replace(/^\s+/,"");
        
        // split on white space
        chunk = chunk.split(/\s+/);
        
        var numVerts = chunk.length/numValuesPerLine;
        numParsedPoints += numVerts;

        var verts = new Float32Array(numVerts*3);
        var cols = null;
        var norms = null;

        if(colorsPresent){
          cols = new Float32Array(numVerts*3);
        }
        
        if(normalsPresent){
          norms = new Float32Array(numVerts*3);
        }

        // depending if there are colors, 
        // we'll need to read different indices.
        // if there aren't:
        // x  y  z  r  g  b  nx ny nz
        // 0  1  2  3  4  5  6  7  8 <- normals start at index 6
        //
        // if there are:
        // x  y  z  nx ny nz
        // 0  1  2  3  4  5 <- normals start at index 3
        var valueOffset = 0;
        if(colorsPresent){
          valueOffset = 3;
        }

        // xyz  rgb  normals
        for(var i = 0, j = 0, len = chunk.length; i < len; i += numValuesPerLine, j += 3){
          verts[j]   = parseFloat(chunk[i]);
          verts[j+1] = parseFloat(chunk[i+1]);
          verts[j+2] = parseFloat(chunk[i+2]);

          // XBPS spec for parsers requires colors to be normalized
          if(cols){
            cols[j]   = parseInt(chunk[i+3])/255;
            cols[j+1] = parseInt(chunk[i+4])/255;
            cols[j+2] = parseInt(chunk[i+5])/255;
          }

          if(norms){
            norms[j]   = parseFloat(chunk[i + 3 + valueOffset]);
            norms[j+1] = parseFloat(chunk[i + 4 + valueOffset]);
            norms[j+2] = parseFloat(chunk[i + 5 + valueOffset]);
          }
        }
        
        // !! pushing on null?
        parsedVerts.push(verts);
        parsedCols.push(cols);
        parsedNorms.push(norms);
         
        // !! needs test
        // !! needs comment
        var test = {};
        if(verts){test["VERTEX"] = verts;}
        if(cols){test["COLOR"] = cols;}
        if(norms){test["NORMAL"] = norms;}

        parseCallback(test, AJAX.parser);
      };
    
      /**
        may occur 0 or many times
      */
      AJAX.onprogress = function(evt){
        onProgressCalled = true;

        // if we have something to actually parse
        if(AJAX.responseText){
          var ascData = AJAX.responseText;

          // we likely stopped getting data somewhere in the middle of 
          // a line in the ASC file
          
          // 5.813 2.352 6.500 0 0 0 2.646 3.577 2.516\n
          // 1.079 1.296 9.360 0 0 0 4.307 1.181 5.208\n
          // 3.163 2.225 6.139 0 0 0 0.6<-- stopped here
          
          // So find the last known newline. Everything from the last
          // request to this last newline can be placed in a buffer.
          var lastNewLineIndex = ascData.lastIndexOf("\n");
          AJAX.lastNewLineIndex = lastNewLineIndex;
          
          // if the status just changed and we finished downloading the
          // file, grab everyting until the end. If there is only a bunch
          // of whitespace, make a note of that and don't bother parsing.
          if(AJAX.readyState === XHR_DONE){
            var chunk = ascData.substring(AJAX.startOfNextChunk, ascData.length);
            // If the last chunk doesn't have any digits (just spaces)
            // don't parse it.
            if(chunk.match(/[0-9]/)){
              AJAX.parseChunk(chunk);
            }
          }
          // if we still have more data to go
          else{
            // Start of the next chunk starts after the newline.
            var chunk = ascData.substring(AJAX.startOfNextChunk, lastNewLineIndex + 1);
            AJAX.startOfNextChunk = lastNewLineIndex + 1;
            AJAX.parseChunk(chunk);
          }
        }
      };//onprogress
      
      AJAX.open("GET", path, true);
      AJAX.send(null);
    };// load
  }//ctor
  return ASCParser;
}());
