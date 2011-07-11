/*
  Copyright (c) 2010  Seneca College
  MIT LICENSE
*/
/**
  @class 
    If the hps0 files have normals, there will be
  
  - 3 bytes for X
  - 3 bytes for Y
  - 3 bytes for Z
  
  - 1 byte for Red
  - 1 byte for Green
  - 1 byte for Blue
  
  If the hps0 files do NOT have normals, there will be
  
  - 2 bytes for X
  - 2 bytes for Y
  - 2 bytes for Z
  
  - 2 bytes for Red, Green and Blue
  
  <pre>
  <xml tags>
  <that have relevant>
  <information= about the file>
  Binary Data...
  (3 bytes for x, 3 bytes for y, 3 bytes for z and 3 bytes for rgb)
  ...
  ...
  ...
  ...
  location and color data end for points
  normal data start
  (every 3 bytes is compressed normal data)
  ...
  ...
  ...
  <more tags>
  <to close opening tags>
  <and provide more information>
  
  // HPS0  
  // <Level=0>
  // <BinaryCloud>
  // <Format=1>
  // <NumPoints= 11158 0 >
  // <SpotSize= 0.134696 >
  // <Min= -24.1075 -28.9434 -16.8786 >
  // <Max= -12.4364 -14.8525 -18.72375 >
  // ...\
  // ... }- binary data (vertices & colors)
  // .../
  // ...\
  // ... }- possibly more binary data (normals)
  // .../
  // </Level=0>
  // </PsCloudModel>
          
</pre>

*/
var HPS0Parser = (function(){

  /**
    @private
  */
  function HPS0Parser(config){
    
    var gotHeader = false;
      
    var numTotalPoints;
    
    // !!!
    var normalsPresent = false;
    var colorsPresent = true;
    
    // If the PSI file has normals, this will be true.
    var hasNormals = false;

    // If the PSI file has normals, we'll have 9 bytes for XYZ
    // and 3 for RGB. (12)
    // If the PSI does NOT have normals, we'll have 6 bytes for XYZ
    // and 2 for RGB. (8)
    // So when we're streaming in the bytes, we'll need to know what
    // parts are the vertices and which parts are the colors.
    var byteIncrement;
    
    // Values to be used in decompression of HPS0 files.
    var diffX, diffY, diffZ;
    var xMin, yMin, zMin;
    var xMax, yMax, zMax;
    var scaleX, scaleY, scaleZ;

    const SFACTOR = 16777216; // 2^24
    const NFACTOR = -0.5 + 1024; // 2^10
    
    var startOfBin;
    var last12Index;
    var startOfNextChunk = 0;
    

    // keep track if onprogress event handler was called to 
    // handle Chrome/WebKit vs. Firefox differences.
    //
    // Firefox will call onprogress zero or many times
    // Chrome/WebKit will call onprogress one or many times
    var onProgressCalled;
      
      
    this.__defineGetter__("numTotalPoints", function(){
      return numTotalPoints;
    });
    
    
    /**
    */
    var parseChunk = function(chunk){
    
      // !! Fix this.
      // This occurs over network connections, but not locally.
      if(chunk){
      
        var numVerts = chunk.length/byteIncrement;
        var numBytes = chunk.length;
        
        //
        var verts, cols, norms;
        
        // !!! COMMENT
        if(onProgressCalled === true){

          // !!! this needs to be changed.
          // if colors are present, we know we're still
          // dealing with vertices.
          if(numVerts > 0 && colorsPresent){
            // !!! only for debugging, remove on prduction
            if(numVerts !== Math.floor(numVerts)){
              console.log("invalid numVerts: " + numVerts);
              numVerts = Math.floor(numVerts);
            }
            verts = new Float32Array(numVerts * 3);
            cols = new Float32Array(numVerts * 3);
          }
          
          // parsing normal values, not sure the logic behind it (as it was never provided)
          // we take 3 bytes and apply some bit shifting operations on it
          // we then take the results and multiply it to some set values
          // the normals are the resulting values
          if(numBytes > 0 && normalsPresent){
          
            if(numBytes !== Math.floor(numBytes)){
              console.log('invalid num bytes');
            }
            norms = new Float32Array(numBytes);
            parseNorms(chunk, numBytes, 0, norms);
          }
          // parsing xyz and rgb values, not sure behind the logic either
          // 3 bytes are used for each x, y, z values
          // each of the last 3 bytes of the 12 correspond to an rgb value
          else{
            var byteIdx = 0;
            parseVertsCols(chunk, numBytes, byteIdx, verts, cols);
          }
        }
        
        var attributes = {};
        // ps vertex needs to be the first element!
        if(verts){attributes["ps_Vertex"] = verts;}
        if(cols){ attributes["ps_Color"] = cols;}
        if(norms){ attributes["ps_Normal"] = norms;}
        
        return attributes;
      }
    }
    
    /**
      @private
      
      @param {String} str
      @param {Number} iOffset
    */
    var getByte = function(str, iOffset){
      return str.charCodeAt(iOffset) & 0xFF;
    }
    
    /**
      @private
      
      @param {String} str
      @param {Number} iOffset
    */
    var getBytes2 = function(str, iOffset){
      return ((getByte(str, iOffset + 1) << 8) + getByte(str, iOffset)) << 8;
    };

    /**
      @private
      
      @param {String} str
      @param {Number} iOffset - Must be an int.
      
      @returns
    */
    var getBytes3 = function(str, iOffset){
      return (((getByte(str, iOffset + 2) << 8) + getByte(str, iOffset + 1)) << 8) + getByte(str, iOffset);
    };


    /*
     
    */
    var parseVertsCols = function(chunk, numBytes, byteIdx, verts, cols){
      var byte1, byte2, short;
      
      for(var point = 0; point < numBytes/byteIncrement; byteIdx += byteIncrement, point++){
        // If the PSI file has normals, there are 3 bytes for each component.
        if(hasNormals){
          verts[point*3 + 0] = (diffX * getBytes3(chunk, byteIdx    )) / scaleX;
          verts[point*3 + 1] = (diffY * getBytes3(chunk, byteIdx + 3)) / scaleY;
          verts[point*3 + 2] = (diffZ * getBytes3(chunk, byteIdx + 6)) / scaleZ;

          cols[point*3 + 0] = getByte(chunk, byteIdx +  9) / 255;
          cols[point*3 + 1] = getByte(chunk, byteIdx + 10) / 255;
          cols[point*3 + 2] = getByte(chunk, byteIdx + 11) / 255;
        }
        else{
          verts[point*3 + 0] = (diffX * getBytes2(chunk, byteIdx    )) / scaleX;
          verts[point*3 + 1] = (diffY * getBytes2(chunk, byteIdx + 2)) / scaleY;
          verts[point*3 + 2] = (diffZ * getBytes2(chunk, byteIdx + 4)) / scaleZ;

          byte1 = getByte(chunk, byteIdx + 6);
          byte2 = getByte(chunk, byteIdx + 7);
         
          short = (byte2 << 8) + byte1;
          
          cols[point*3]     = (((short>>10) & 0x1F) << 3)/255;
          cols[point*3 + 1] = (((short>>5) & 0x1F) << 3)/255;
          cols[point*3 + 2] = ((short & 0x1F) << 3)/255;
        }
      }
    };
    
    /*
      @param {String} chunk
      @param {Number} numBytes
      @param {Number} byteIdx
      @param {ArrayBuffer} norms
    */
    var parseNorms = function(chunk, numBytes, byteIdx, norms){
      var nzsign, nx11bits, ny11bits, ivalue;
      var nvec = new Float32Array(3);
      
      // Start reading the normals where we left off reading the
      // vertex positions and colors.
      // Each normal is 3 bytes.
      for(var point = 0; byteIdx < numBytes; byteIdx += 3, point += 3){

        ivalue = getBytes3(chunk, byteIdx);
        nzsign =   (ivalue >> 22) & 0x0001;
        nx11bits = (ivalue) & 0x07ff;
        ny11bits = (ivalue >> 11) & 0x07ff;
        
        if(nx11bits >= 0 && nx11bits < 2048 && ny11bits >= 0 && ny11bits < 2048){

          nvec[0] = (nx11bits/NFACTOR) - 1.0;
          nvec[1] = (ny11bits/NFACTOR) - 1.0;
          
          var nxnymag = nvec[0]*nvec[0] + nvec[1]*nvec[1];
          
          // Clamp values.
          nxnymag = Math.min(nxnymag, 1);
          nxnymag = Math.max(nxnymag,-1);
          nxnymag = 1 - nxnymag;

          nxnymag = Math.min(nxnymag, 1);
          nxnymag = Math.max(nxnymag,-1);
          
          nvec[2] = Math.sqrt(nxnymag);
          
          if (nzsign){
            nvec[2] = -nvec[2];
          }
          var dNorm = nvec[0]*nvec[0] + nvec[1]*nvec[1] + nvec[2]*nvec[2];
          
          dNorm = (dNorm > 0) ? Math.sqrt(dNorm) : 1;
          
          norms[point]   = nvec[0]/dNorm;
          norms[point+1] = nvec[1]/dNorm;
          norms[point+2] = nvec[2]/dNorm;
        }
      }
    };
    
    
        
    /**
    */
    var readHeader = function(textData){

      // !!
      // see if we have the entire Max tag, if we don't wait around
      // until we do.
      var maxTagIdx = textData.indexOf("<Max=");
      if(maxTagIdx !== -1){
        var endTag =  textData.indexOf(">", maxTagIdx);
        if(endTag == -1){
          return;
        }
      }
      
      var numPtsIdx = textData.indexOf("<NumPoints=");
      endTagIdx = textData.indexOf(">", numPtsIdx);
      
      // <NumPoints= 57507 2 0 57507 0 0 >
      var numPtsValuesStr = textData.substring((numPtsIdx + "<NumPoints=".length), endTagIdx);
      var numPtsValuesArr = numPtsValuesStr.split(" ");
      
      // Multiply by 1 to convert to a Number type.
      numTotalPoints = numPtsValuesArr[1] * 1;
      // We can find out if there are normals by inspecting <NumPoints>
      // <NumPoints= 11158 1 >
      // <NumPoints= 11158 2 >
      // If the second value is 0, the file does not contain normals.
      if((numPtsValuesArr[2] * 1) !== 0){
        hasNormals = true;
      }
      
      /// !!! var...
      // posMinStr - lowest value in the file (used for decompression)
      minIdx = textData.indexOf("<Min=");
      
      endTagIdx = textData.indexOf(">", minIdx);
      var temp = textData.substring((minIdx + "<Min=".length), endTagIdx);
      var posMinArr = temp.split(" ");
      
      // Multiply by 1 to convert to a Number type.
      xMin = posMinArr[1] * 1;
      yMin = posMinArr[2] * 1;
      zMin = posMinArr[3] * 1;
      
      // posMaxStr - highest value in the file (used for decompression)
      maxIdx = textData.indexOf("<Max=");

      endTagIdx = textData.indexOf(">", maxIdx);
      var temp = textData.substring((maxIdx + "<Max=".length), endTagIdx);
      var posMaxArr = temp.split(" ");
      
      // Multiply by 1 to convert to a Number type.
      xMax = posMaxArr[1] * 1;
      yMax = posMaxArr[2] * 1;
      zMax = posMaxArr[3] * 1;
      
      bgnTag = textData.substring(maxIdx, endTagIdx + 1);
      
      // !! fix me
      startOfBin = textData.indexOf(">", maxIdx) + 3;
      
      diffX = xMax - xMin;
      diffY = yMax - yMin;
      diffZ = zMax - zMin;

      scaleX = SFACTOR + xMin;
      scaleY = SFACTOR + yMin;
      scaleZ = SFACTOR + zMin;
      
      // If normals:
      // 9 for XYZ
      // 3 for RGB
      
      // else: 
      // 6 for XYZ
      // 2 for RGB  
      byteIncrement = hasNormals ? 12 : 8;
      
      // If we got this far, we can start parsing values and we don't
      // have to try running this function again.
      gotHeader = true;
    }









                    /*   
            // Checks if begin or end tags can be found using regex.
            var binBeginIdx = textData.indexOf(bgnTag);
            var infoEnd = textData.indexOf("</Level=");
            // This contains our raw binary data.
            // +2 bytes for offset values: \r\n
            var binData = textData.substring(binBeginIdx + bgnTag.length + 2, infoEnd);
            var numBytes = binData.length;
            var attributes = {};
            var verts = new Float32Array(numTotalPoints * 3);
            var cols  = new Float32Array(numTotalPoints * 3);
            parseVertsCols_HPS0(binData, numBytes, 0, verts, cols);
            // ps vertex needs to be the first element!
            if(verts){attributes["ps_Vertex"] = verts;}
            if(cols){ attributes["ps_Color"] = cols;}
            var norms;
            // Parse the normals if we have them.
            if(hasNormals){
              norms = new Float32Array(numTotalPoints * 3);
              parseNorms_HPS0(binData, numBytes, numTotalPoints * byteIncrement, norms);
              attributes["ps_Normal"] = norms;
            }*/
    /**
    */
    this.onload = function(textData){
      
      // If we downloaded the entire file in one request.
      if(!gotHeader){
        readHeader(textData);
        
        // Checks if begin or end tags can be found using regex.
        var binBeginIdx = textData.indexOf(bgnTag);
        var infoEnd = textData.indexOf("</Level=");
        
        // This contains our raw binary data.
        // +2 bytes for offset values: \r\n
        var binData = textData.substring(binBeginIdx + bgnTag.length + 2, infoEnd);
        var numBytes = binData.length;

        var attributes = {};
        var verts = new Float32Array(numTotalPoints * 3);
        var cols  = new Float32Array(numTotalPoints * 3);
        parseVertsCols(binData, numBytes, 0, verts, cols);

        // ps vertex needs to be the first element!
        if(verts){attributes["ps_Vertex"] = verts;}
        if(cols){ attributes["ps_Color"] = cols;}
        
        var norms;
        
        // Parse the normals if we have them.
        if(hasNormals){
          norms = new Float32Array(numTotalPoints * 3);
          parseNorms(binData, numBytes, numTotalPoints * byteIncrement, norms);
          attributes["ps_Normal"] = norms;
        }
        return attributes;        
      }
      

      var infoEnd = textData.indexOf("</Level=");

      var chunk = textData.substring(startOfNextChunk, infoEnd);

      // If the file has normals as indicated at the start of the file.
      if(hasNormals){
        normalsPresent = true;
        colorsPresent = false;
      }
      else{
        chunk = textData.substring(AJAX.startOfNextChunk-1, infoEnd-1);
      }

      return parseChunk(chunk);
    }
    
    /**
    */
    this.onprogress = function(textData){
      
      var chunkLength = textData.length;
      
      // If this is the first call to onprogress, try to read in the header.
      if(!gotHeader){
        readHeader(textData);
        
        // readHeader() will have attempted to read at least the <Min> and <Max>
        // tags, if we aren't that far in the file, we'll need to try again.
        if(!gotHeader){
          return;
        }
        
        // If this is the first time we read the file, start reading the binary data
        // at the start of the binary data rather than somewhere in the middle.
        startOfNextChunk = infoStart = startOfBin;
      }
      
      // The attributes which will be returned.
      var attr;

      onProgressCalled = true;
      
      // Try to find the <Level> and </Level=0> tags which means we would
      // have all the data.
      endTag = "</Level=";
      var tagExists = textData.indexOf(bgnTag);
      var infoEnd = textData.indexOf(endTag);
      var infoStart;
      
      // If the bgnTag exists then set the startOfNextChunk
      // to the end of the bgnTag + 2 for offset values.
      if(tagExists !== -1){
        // +2 for offset values
        tagLen = bgnTag.length + 2;
        infoStart = tagExists + tagLen;
        if(startOfNextChunk === 0){
          startOfNextChunk = infoStart;
        }
      }
      
      // Find the last multiple of 12 in the chunk
      // this is because of the format shown at the top of this parser.
      var last12 = Math.floor((chunkLength - infoStart) / byteIncrement);
      last12Index = (last12 * byteIncrement) + infoStart;
      
      // If the end tag was found.
      if(infoEnd !== -1){
        last12Index = infoEnd;
      }
      
      var totalPointsInBytes = (numTotalPoints * byteIncrement) + infoStart;

      // Handles parsing up to the end of position and colors.
      // Sets the next chunk at the start of normals.
      if((totalPointsInBytes > startOfNextChunk) && (totalPointsInBytes < last12Index)){
        var chunk	= textData.substring(startOfNextChunk, totalPointsInBytes);
        
        if(chunk.length > 0){
          startOfNextChunk = totalPointsInBytes;
          attr = parseChunk(chunk);
        }
      }
      
      // Parse the normals.
      else if((last12Index > totalPointsInBytes) && (startOfNextChunk >= totalPointsInBytes)){
      
        var chunk	= textData.substring(startOfNextChunk, last12Index);
        normalsPresent = true;
        colorsPresent = false;
            
        if(chunk.length > 0){
          startOfNextChunk = last12Index;
          attr = parseChunk(chunk);
        }
      }

      // Parse position and colors.
      else{
        var chunk = textData.substring(startOfNextChunk, last12Index);
        
        // !! debug this
        if(chunk.length > 0){
          startOfNextChunk = last12Index;
          attr = parseChunk(chunk);
        } 
      }
      return attr;
    }
    
    
  }// ctor
  
  return HPS0Parser;
}());
