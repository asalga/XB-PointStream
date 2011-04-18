/*
  Copyright (c) 2010  Seneca College
  MIT LICENSE

  Version:  0.6
  Author:   Mickael Medel
            asydik.wordpress.com
  Created:  February 2011
  Updated:  March 2011
  
  Notes:
  This parser parses .PSI filetypes. These files are Arius3D Proprietary
  files which have their data stored in one of the following ways:
*/
var PSIParser = (function() {

  /**
    Constructor
  */
  function PSIParser(config) {
  
    // Declare tags
    var bgnDocument   = "<PsDocument>",
        endDocument   = "</PsDocument>",
        bgnComposite  = "<PsComposite>",
        endComposite  = "</PsComposite>",
        bgnSubject    = "<PsSubject",
        endSubject    = "</PsSubject>",
        bgnInstance   = "<PsInstance>",
        endInstance   = "</PsInstance>",
        bgnEnv        = "<PsEnvironment>",
        endEnv        = "</PsEnvironment>",
        bgnName       = "<Name>",
        endName       = "</Name>",
        intMatIdStr   = "<Identity>",       // Internal Matrix Identity
        extMatIdStr   = "<ExtIdentity>";    // External Matrix Identity

    var bgnCompList       = "<PsList>",
        endCompList       = "</PsList>",
        compositeModelStr = "CompositeModel:",
        instanceModelStr  = "InstanceModel:",
        nurbSurfaceStr    = "NurbSurface",
        nurbCurveStr      = "NurbCurve",
        lineModelStr      = "LineModel",
        quadMeshStr       = "QuadMeshModel",
        triMeshStr        = "TriMeshModel",
        cloudModelStr     = "CloudModel",
        imgCloudModelStr  = "ImageCloudModel",
        txtObjStr         = "TextObject",
        imgObjStr         = "ImageObject",
        soundObjStr       = "SoundObject",
        octTreeModelStr   = "OctTreeModel",
        openBracket       = "<",
        closeBracket      = ">",
        slashEndMark      = "/",
        psPrefix          = "Ps";

    // Shuffle Config Variable Strings
    var bgnShuffle      = "<Shuffle>",
        endShuffle      = "<\\Shuffle>",
        bgnTempLight    = "<PsTempLight>",
        endTempLight    = "<\\PsTempLight>",
        bgnTempLightVec = "<PsTempLightVec>",
        endTempLightVec = "<\\PsTempLightVec>",
        bgnGlblAmbLight = "<PsGlobalAmbientLight>",
        endGlblAmbLight = "<\\PsGlobalAmbientLight>",
        bgnLightType    = "<PsLightType>",
        endLightType    = "<\\PsLightType>";

    // Environment Variable Strings - <PsEnvironment>
    var posDataStr  = "XYZData=",
        colDataStr  = "RGBData=",
        normDataStr = "IJKData=",
        fileTypeStr = "FileType=",
        compStr     = "Compression=",
        encStr      = "Encryption=",
        wtrMrkStr   = "WaterMark=",
        lenUnitStr  = "LengthUnit=";

    // View Variable Strings
    var bgnViewDef  = "<PointStream_View_Definition>",
        endViewDef  = "</PointStream_View_Definition>",
        quartStr    = "<Q",       // Quarternion Matrix
        pivotStr    = "<P",       // Pivot
        transStr    = "<T",       // Translation
        angStr      = "<A",       // FOV Angle
        scrnSizeStr = "<S",       // Screen Size
        bgColStr    = "<B",       // Background Color
        cv1Str      = "<Cv1";

    // Material Variable Strings
    var bgnTemp1Mat = "<PsTemp1Material>",
        endTemp1Mat = "<\\PsTemp1Material>";

    // Parent Variable Strings
    var bgnParentTag = "<PsParent= '";
        endParentTag = "'>";

    // PsSubject Variables Strings
    var selStr  = "Sel=",
        visStr  = "Vis=",
        lockStr = "Lok=",
        actStr  = "Act=";

    // Token Model Variable Strings
    var bgnLineModel    = "<PsLineModel>",
        bgnCloudModel   = "<PsCloudModel>",
        bgnImgCldModel  = "<PsImageCloudModel>",
        bgnTriMeshModel = "<PsTriMeshModel>",
        bgnNurbCurve    = "<PsNurbCurve>",
        bgnNurbSurface  = "<PsNurbSurface>",
        bgnTextObject   = "<PsTextObject>",
        bgnImageObject  = "<PsImageObject>",
        bgnSoundObject  = "<PsSoundObject>",
        bgnOctTreeModel = "<PsOctTreeModel>";

    // Level of Detail Variable Strings
    var numLvlStr   = "<NumLevels=",
        scnMatStr   = "<ScanMatrix:",
        bgnLvlStr   = "<Level=",
        endLvlStr   = "</Level=",
        binCloudStr = "<BinaryCloud>",
        ascCloudStr = "<AsciiCloud>",
        fmtStr      = "<Format=";

    var numPtStr  = "<NumPoints=",
        sptSzStr  = "<SpotSize=",
        posMinStr = "<Min=",
        posMaxStr = "<Max=",
        endXMLStr = ">";
    
    var undef;
    
    var __empty_func = function(){};
  
    var start = config.start || __empty_func;
    var parse = config.parse || __empty_func;
    var end = config.end || __empty_func;
    
    var version = "0.6";
    
    const UNKNOWN = -1;
    const XHR_DONE = 4;
    const STARTED = 1;

    var pathToFile = null;
    var fileSize = 0;
    
    //
    var numParsedPoints = 0;
    var numTotalPoints = 0;
    var progress = 0;
    
    //
    var numValuesPerLine = -1;
    var normalsPresent = false;
    var colorsPresent = true;
    var layoutCode = UNKNOWN;
    
    // Length of the arrays we'll be sending the library.
    var BUFFER_SIZE = 3000;
    
    //
    var tempBufferV;
    var tempBufferOffsetV = 0;

    var tempBufferC;
    var tempBufferOffsetC = 0;

    var tempBufferN;
    var tempBufferOffsetN = 0;

    //
    var parsedVerts = [];
    var parsedCols = [];
    var parsedNorms = [];
    
    var firstRun = true;
    
    //
    var xMax = 0;
    var xMin = 0;
    var yMax = 0;
    var yMin = 0;
    var zMax = 0;
    var zMin = 0;
    var sfactor = 0;
    var	nfactor = 0;
    
    //
    var bgnTag = "";
    var endTag = "";
    var tagExists;
    var endTagExists
    
    // keep track if onprogress event handler was called to 
    // handle Chrome/WebKit vs. Minefield differences.
    //
    // Minefield will call onprogress zero or many times
    // Chrome/WebKit will call onprogress one or many times
    var onProgressCalled = false;
    var AJAX = null;
    
    /**
      @private
      
      Functions to deal with specific bytes in the stream
      
      @returns normalized value of byte
    */
    var getByteAt = function(str, iOffset){
      return (str.charCodeAt(iOffset) & 0xFF);
    };
      
    /**
      @private
      
      @param {} str
      @param {} iOffset
      
      @returns
    */
    var getXYZ = function(str, iOffset){
      return ((((getByteAt(str, iOffset + 2) << 8) + getByteAt(str, iOffset + 1)) << 8) + getByteAt(str, iOffset));
    };
    
    /**
      @private
      
      @param {} str
      @param {} iOffset
      
      @returns
    */
    var getRGB = function(str, iOffset){
      return getByteAt(str, iOffset);
    };
    
    /**
      @private
      
      This function takes in a variable length array and chops it into
      equal sized parts since the library requires the array of attributes
      to be of equal size.
      
      Any excess values which don't entirely fit into the buffers created will
      be returned along with their length so the next iteration can fill them 
      up from there.
      
      @param {} arr
      @param {} tempBuffer
      @param {} tempBufferOffset
      @param {} Which attribute are we sending in? 1 = vertex, 2 = color, 3 = normal
      
      @returns {Object}
    */
    var partitionArray = function(arr, tempBuffer, tempBufferOffset, AttribID){
      // If we don't have enough for one buffer, just add it and wait for the next call.
      if(arr.length + tempBufferOffset < BUFFER_SIZE){
        // if this is the start of a new buffer
        if(!tempBuffer){
          tempBuffer = new Float32Array(BUFFER_SIZE);
          tempBuffer.set(arr);
        }
        // If the buffer already exists, we're going to be adding to it. Don't worry about
        // over filling the buffer since we already know at this point that won't happen.
        else{
          tempBuffer.set(arr, tempBufferOffset);
        }
        tempBufferOffset += arr.length;
      }
   
      // If what we have in the temp buffer and what we just parsed is too large for one buffer
      else if(arr.length + tempBufferOffset >= BUFFER_SIZE){
      
        // if temp buffer offset is zero, Find out how many buffers we can fill up with this set of vertices
        var counter = 0;
        var numBuffersToFill = parseInt(arr.length/BUFFER_SIZE);
      
        // If there is something already in the buffer, fill up the rest.
        if(tempBufferOffset > 0){
          // Add the vertices from the last offset to however much we need to fill the temp buffer.
          var amtToFill = BUFFER_SIZE - tempBufferOffset;
          tempBuffer.set(arr.subarray(0, amtToFill), tempBufferOffset);
          
          switch(AttribID){
            case 1: numParsedPoints += BUFFER_SIZE/3;
                    parse(AJAX.parser, {"ps_Vertex": tempBuffer});
                    break;
            case 2: parse(AJAX.parser, {"ps_Color":  tempBuffer});break;
            case 3: parse(AJAX.parser, {"ps_Normal": tempBuffer});break;
          }
          
          // now find out how many other buffers we can fill
          numBuffersToFill = parseInt((arr.length - amtToFill)/BUFFER_SIZE);
          counter = amtToFill;
        }
        
        // Create and send as many buffers as we can with
        // this chunk of data.
        for(var buffIter = 0; buffIter < numBuffersToFill; buffIter++){
          var buffer = new Float32Array(BUFFER_SIZE);
          
          buffer.set(arr.subarray(counter, counter + BUFFER_SIZE));
 
          switch(AttribID){                    
            case 1: numParsedPoints += BUFFER_SIZE/3;
                    parse(AJAX.parser, {"ps_Vertex": buffer});
                    break;
            case 2: parse(AJAX.parser, {"ps_Color":  buffer});break;
            case 3: parse(AJAX.parser, {"ps_Normal": buffer});break;
          }
          
          counter += BUFFER_SIZE;
        }
        
        // put the end of the attributes in the first part of the temp buffer
        tempBuffer = new Float32Array(BUFFER_SIZE);
        tempBuffer.set(arr.subarray(counter, counter + arr.length));
        tempBufferOffset = arr.length - counter;
      }
      
      // return the changes
      return {
        buffer: tempBuffer,
        offset: tempBufferOffset
      };
    }
    
    /**
      Returns the version of this parser
      
      @returns {String} parser version
    */
    this.__defineGetter__("version", function(){
      return version;
    });
    
    /**
      Get the number of parsed points so far
      
      @returns {Number} number of points parsed.
    */
    this.__defineGetter__("numParsedPoints", function(){
      return numParsedPoints;
    });
    
    /**
      Get the total number of points in the point cloud.
      
      @returns {Number}
    */
    this.__defineGetter__("numTotalPoints", function(){
      return numTotalPoints;
    });
    
    /**
      Returns the progress of downloading the point cloud
      
      @returns {Number} value from zero to one or -1 if unknown.
    */
    this.__defineGetter__("progress", function(){
      return progress;
    });
    
    /**
    */
    this.__defineGetter__("fileSize", function(){
      return fileSize;
    });
    
    /**
      Stop downloading and parsing the associated point cloud.
    */
    this.stop = function(){
      if(AJAX){
        AJAX.abort();
      }
    };
    
    /**
      @param {String} pathToFile
    */
    this.load = function(path){
      pathToFile = path;

      AJAX = new XMLHttpRequest();
      AJAX.startOfNextChunk = 0;
      AJAX.last12Index = 0;
      
      // put a reference to the parser in the AJAX object
      // so we can give the library a reference to the
      // parser within the AJAX event handler scope.
      // !! eventually need to fix this
      AJAX.parser = this;

      /**
        Occurs exactly once when the resource begins to be downloaded.
      */
      AJAX.onloadstart = function(evt){
        sfactor = Math.pow(2.0, 24.0);
        nfactor = -0.5 + Math.pow(2.0, 10.0);
        start(AJAX.parser);
      };
            
      /*
        Occurs exactly once, when the file is done being downloaded.
        
        @param {} evt
      */
      AJAX.onload = function(evt){
      
        var textData = AJAX.responseText;
        var chunkLength = textData.length;
        
        if(firstRun){
          AJAX.firstLoad(textData);
        }
        
        endTag = endLvlStr;
        tagExists = textData.indexOf(bgnTag);
        var infoEnd = textData.indexOf(endTag);
        var infoStart;
        
        if(tagExists !== -1){
          tagLen = bgnTag.length + 2;               // +2 for offset values
          infoStart = tagExists + tagLen;
          if(AJAX.startOfNextChunk === 0){
            AJAX.startOfNextChunk = infoStart;
          }
        }
        
        var last12 = Math.floor((chunkLength - infoStart) / 12);
        AJAX.last12Index = ((last12 * 12) + infoStart);
        
        if(infoEnd !== -1){
          AJAX.last12Index = infoEnd;
        }
        // if the onprogress event didn't get called--we simply got
        // the file in one go, we can parse from start to finish.
        if(onProgressCalled === false){
          var chunk = textData.substring(AJAX.startOfNextChunk, AJAX.last12Index);
        }
        // otherwise the onprogress event was called at least once,
        // that means we need to get the data from a specific point to the end.
        else if(infoEnd !== -1){
          var chunk = textData.substring(AJAX.startOfNextChunk, AJAX.last12Index);
        }

        AJAX.parseChunk(chunk);

        if(tempBufferV && tempBufferOffsetV > 0){
          // Only send the data if there's actually something to send.
          var lastBufferV = tempBufferV.subarray(0, tempBufferOffsetV);
          numParsedPoints += tempBufferOffsetV/3;
          parse(AJAX.parser, {"ps_Vertex": lastBufferV});
        }
        
        if(tempBufferC && tempBufferOffsetC > 0){
          // Only send the data if there's actually something to send.
          var lastBufferC = tempBufferC.subarray(0, tempBufferOffsetC);
          parse(AJAX.parser, {"ps_Color": lastBufferC});
        }
        
        if(tempBufferN && tempBufferOffsetN > 0){
          // Only send the data if there's actually something to send.
         var lastBufferN = tempBufferN.subarray(0, tempBufferOffsetN);
         parse(AJAX.parser, {"ps_Normal": lastBufferN});
        }

        progress = 1;
        
        end(AJAX.parser);
      }
      
      /**
        !! fix me
      */
      AJAX.parseChunk = function(chunkData){
        var chunk = chunkData;
        
        // !! fix this
        // this occurs over network connections, but not locally.
        if(chunk){
        
          var numVerts = chunk.length/12;
          var numBytes = chunk.length;
          
          //
          var verts, cols, norms;
          
          // Fix this
          if(numVerts > 0 && !normalsPresent){
            verts = new Float32Array(numVerts * 3);
          }

          // !!! We need to fix this hack
          if(colorsPresent && numVerts > 0){
            numVerts = Math.floor(numVerts);
            cols = new Float32Array(numVerts * 3);
          }
          
          if(normalsPresent){
            norms = new Float32Array(numBytes);
            var nzsign, nx11bits, ny11bits, ivalue;
            var nvec = new Float32Array(3);
            
            for(var	i = 0; i < numBytes; i += 3){
            	ivalue = getXYZ(chunk, i);
              nzsign = ((ivalue >> 22) & 0x0001);
              nx11bits = ((ivalue) & 0x07ff);
              ny11bits = ((ivalue >> 11) & 0x07ff);
              
              if(nx11bits >= 0 && nx11bits < 2048){
              	if(ny11bits >= 0 && ny11bits < 2048){
                  nvec[0] = (nx11bits/nfactor) - 1.0;
                  nvec[1] = (ny11bits/nfactor) - 1.0;
                  
                  var nxnymag = (nvec[0]*nvec[0] + nvec[1]*nvec[1]);
                  if (nxnymag > 1){  nxnymag = 1; }
                  if (nxnymag < -1){ nxnymag = -1; }
                  nxnymag = 1 - nxnymag;
                  
                  if (nxnymag > 1){  nxnymag = 1; }
                  if (nxnymag < -1){ nxnymag = -1; }
                  nvec[2] = Math.sqrt(nxnymag);
		              
                  if (nzsign){ nvec[2] = -nvec[2]; }
                  var dNorm = (nvec[0]*nvec[0] + nvec[1]*nvec[1] + nvec[2]*nvec[2]);
                  if (dNorm > 0){ dNorm = Math.sqrt(dNorm); }
                  else{ dNorm = 1; }
              
		              norms[i] =   nvec[0]/dNorm;
    		          norms[i+1] = nvec[1]/dNorm;
        		      norms[i+2] = nvec[2]/dNorm;
								}
              }
            }
          }
          else{
          	for(var i = 0, j = 0; i < numBytes; i+=12, j += 3){
            	verts[j]   = ((xMax - xMin) * getXYZ(chunk, i  )) / sfactor + xMin;
        	    verts[j+1] = ((yMax - yMin) * getXYZ(chunk, i+3)) / sfactor + yMin;
          	  verts[j+2] = ((zMax - zMin) * getXYZ(chunk, i+6)) / sfactor + zMin;
            
      	      if(cols){
        	      cols[j]   = getRGB(chunk, i+9 ) / 255;
          	    cols[j+1] = getRGB(chunk, i+10) / 255;
            	  cols[j+2] = getRGB(chunk, i+11) / 255;
            	}
      	    }
          }
          
          if(verts){
            var o = partitionArray(verts, tempBufferV, tempBufferOffsetV, 1);
            tempBufferV = o.buffer;
            tempBufferOffsetV = o.offset;
          }
          if(cols){
            var o = partitionArray(cols, tempBufferC, tempBufferOffsetC, 2);
            tempBufferC = o.buffer;
            tempBufferOffsetC = o.offset;
          }
          if(norms){
            var o = partitionArray(norms, tempBufferN, tempBufferOffsetN, 3);
            tempBufferN = o.buffer;
            tempBufferOffsetN = o.offset;
          }
        }
      };
      
      /*
      */
      AJAX.firstLoad = function(textData){
        var chunkLength = textData.length;
          
        var temp;
        
        // numPtStr
        tagExists = textData.indexOf(numPtStr);
        if(tagExists !== -1){
          endTagExists = textData.indexOf(endXMLStr, tagExists);
          temp = textData.substring((tagExists + numPtStr.length), endTagExists);
          var numPtArr = temp.split(" ");
          
          // Multiply by 1 to convert to a Number type.
          numTotalPoints = numPtArr[1] * 1;
        }
        
        //sptSzStr
        
        //posMinStr
        tagExists = textData.indexOf(posMinStr);
        if(tagExists !== -1){
          endTagExists = textData.indexOf(endXMLStr, tagExists);
          temp = textData.substring((tagExists + posMinStr.length), endTagExists);
          var posMinArr = temp.split(" ");
          
          // Multiply by 1 to convert to a Number type.
          xMin = posMinArr[1] * 1;
          yMin = posMinArr[2] * 1;
          zMin = posMinArr[3] * 1;
        }
        
        // posMaxStr
        tagExists = textData.indexOf(posMaxStr);
        if(tagExists !== -1){
          endTagExists = textData.indexOf(endXMLStr, tagExists);
          temp = textData.substring((tagExists + posMaxStr.length), endTagExists);
          var posMaxArr = temp.split(" ");
          
          // Multiply by 1 to convert to a Number type.
          xMax = posMaxArr[1] * 1;
          yMax = posMaxArr[2] * 1;
          zMax = posMaxArr[3] * 1;
          
          bgnTag = textData.substring(tagExists, (endTagExists + 1));
        }
      }
    
      /**
        On Minefield, this will occur zero or many times
        On Chrome/WebKit this will occur one or many times
      */
      AJAX.onprogress = function(evt){
      
       if(evt.lengthComputable){
          fileSize = evt.total;
          progress = evt.loaded/evt.total;
        }

        onProgressCalled = true;

        // if we have something to actually parse
        if(AJAX.responseText){
          var textData = AJAX.responseText;
          var chunkLength = textData.length;

          if(firstRun){
            AJAX.firstLoad(textData);
          }
          
          endTag = endLvlStr;
          tagExists = textData.indexOf(bgnTag);
          var infoEnd = textData.indexOf(endTag);
          var infoStart;
          
          if(tagExists !== -1){
            // +2 for offset values
            tagLen = bgnTag.length + 2;
            infoStart = tagExists + tagLen;
            if(AJAX.startOfNextChunk === 0){
              AJAX.startOfNextChunk = infoStart;
            }
          }
          
          var last12 = Math.floor((chunkLength - infoStart) / 12);
          AJAX.last12Index = ((last12 * 12) + infoStart);
          
          if(infoEnd !== -1){
            AJAX.last12Index = infoEnd;
          }
          
          var totalPointsInBytes = (numTotalPoints * 12) + infoStart;

          // handles parsing up to the end of position and colors
          if((totalPointsInBytes > AJAX.startOfNextChunk) && (totalPointsInBytes < AJAX.last12Index)){
            var chunk	= textData.substring(AJAX.startOfNextChunk, totalPointsInBytes);
            AJAX.startOfNextChunk = totalPointsInBytes;
            
            if(chunk.length > 0){
            	AJAX.parseChunk(chunk);
            }
          }
          // parse position and colors
          else if(AJAX.last12Index <= totalPointsInBytes){
          	if(firstRun){
           	  var chunk = textData.substring(AJAX.startOfNextChunk, AJAX.last12Index);
							firstRun = false;
						}
            else{
            	var chunk = textData.substring(AJAX.startOfNextChunk, AJAX.last12Index);
            }

            if(chunk.length > 0){
							AJAX.startOfNextChunk = AJAX.last12Index;
            	AJAX.parseChunk(chunk);
						}
          }
          // parse normals
          else if((AJAX.last12Index > totalPointsInBytes) && (AJAX.startOfNextChunk >= totalPointsInBytes)){
            var chunk	= textData.substring(AJAX.startOfNextChunk, AJAX.last12Index);
            normalsPresent = true;
            
            if(chunk.length > 0){
							AJAX.startOfNextChunk = AJAX.last12Index;
            	AJAX.parseChunk(chunk);
						}
          }
        }// AJAX.responseText
      };// onprogress
      
      // open an asynchronous request to the path
      AJAX.open("GET", path, true);
      AJAX.overrideMimeType('text/plain; charset=x-user-defined');
      AJAX.send(null);
    };// load
  }// ctor
  return PSIParser;
}());
