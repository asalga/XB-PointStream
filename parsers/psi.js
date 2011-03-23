/*
  Copyright (c) 2010  Seneca College
  MIT LICENSE

  Version:  0.1
  Author:   Mickael Medel
            asydik.wordpress.com
  Date:     February 2011
  
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
    
    var version = "0.1";
    
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
    
    //
    var parsedVerts = [];
    var parsedCols = [];
    var parsedNorms = [];
    
    var firstRun = true;
    var firstParserRun = true;
    
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
    
    // WebGL compatibility wrapper
    try{
      Float32Array;
    }catch(ex){
      Float32Array = WebGLFloatArray;
    }
    
    /**
      @private
      
      Functions to deal with specific bytes in the stream
      
      @returns normalized value of byte
    */
    var getByteAt = function(chunkData, iOffset){
        var str = chunkData;
        return (str.charCodeAt(iOffset) & 0xFF);
    };
      
    var getXYZ = function(chunkData, iOffset){
      var str = chunkData;
      var rc = ((((getByteAt(str, iOffset + 2) << 8) + getByteAt(str, iOffset + 1)) << 8) + getByteAt(str, iOffset));
      return rc;
    };
    
    var getRGB = function(chunkData, iOffset){
      var str = chunkData;
      var rc = getByteAt(str, iOffset);
      return rc;
    };
  
    
    /*
      Returns the version of this parser
      
      @returns {String} parser version
    */
    this.__defineGetter__("version", function(){
      return version;
    });
    
    /*
      Get the number of parsed points so far
      
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
      pathToFile
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
        occurs exactly once when the resource begins
        to be downloaded
      */
      AJAX.onloadstart = function(evt){
        sfactor = Math.pow(2.0, 24.0);
        nfactor = -0.5 + Math.pow(2.0, 10.0);
        
        start(AJAX.parser);
      };
            
      /*
        occurs exactly once, when the file is done 
        being downloaded
      */
      AJAX.onload = function(evt){
      
        var textData = AJAX.responseText;
        var chunkLength = textData.length;
        
        if(firstRun){
          AJAX.firstLoad(textData);
        }
        
        endTag = "</Level>";
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
        /*else if(textData.length - AJAX.lastNewLineIndex > 1){
          chunk = textData.substring(AJAX.lastNewLineIndex, textData.length);
        }

        // if the last chunk doesn't have any digits (just spaces)
        // don't parse it.
        /*if(chunk && chunk.match(/[0-9]/)){
          AJAX.parseChunk(chunk);
        }*/
        
        AJAX.parseChunk(chunk);

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
          numParsedPoints += numVerts;
          
          var numBytes = chunk.length;

					if(numVerts > 0){
            var verts = new Float32Array(numVerts * 3);
            var cols = null;
            var norms = null;
          }

          if(colorsPresent){
            cols = new Float32Array(numVerts * 3);
          }
          
          if(normalsPresent){
            norms = new Float32Array(numVerts * 3);
            var nzsign, nx11bits, ny11bits, ivalue;
            var nvec = new Float32Array(3);
            
            for(var	i = 0; i < numBytes; i += 3){
            	ivalue = getXYZ(chunk, i);
              nzsign = ((ivalue >> 22) & 0x0001);
              nx11bits = ((ivalue) & 0x07ff);
              ny11bits = ((ivalue >> 11) & 0x07ff);
              
              if(nx11bits >= 0 && nx11bits < 2048){
              	if(ny11bits >= 0 && ny11bits < 2048){
                  nvec[0] = (nx11bits/nfactor) - 1;
                  nvec[1] = (ny11bits/nfactor) - 1;
                  
      		        var nxnymag = (nvec[0]*nvec[0] + nvec[1]+nvec[1]);
          		    if (nxnymag > 1){ nxnymag = 1; }
            		  if (nxnymag < -1){ nxnymag = -1; }
		              nxnymag = 1 - nxnymag;
    		          if (nxnymag > 1){ nxnymag = 1; }
        		      if (nxnymag < -1){ nxnymag = -1; }
            		  nvec[2] = Math.sqrt(nxnymag);
		              if (nzsign){ nvec[2] = -nvec[2]; }
    		          var dNorm = (nvec[0]*nvec[0] + nvec[1]*nvec[1] + nvec[2]*nvec[2]);
        		      if (dNorm > 0){ dNorm = Math.sqrt(dNorm); }
            		  else{ dNorm = 1; }
              
		              norms[i] = nvec[0]/dNorm;
    		          norms[i+1] = nvec[1]/dNorm;
        		      norms[i+2] = nvec[2]/dNorm;
								}
              }
              else{ alert("Nope"); }
              if(i < 100){
                console.log(norms[i] + " " + norms[i+1] + " " + norms[i+2] + "\n");
              }
            }
          }
          else{
          	for(var i = 0, j = 0; i < numBytes; i+=12, j += 3){
            	verts[j] = ((xMax - xMin) * getXYZ(chunk, i)) / sfactor + xMin;
        	    verts[j+1] = ((yMax - yMin) * getXYZ(chunk, i+3)) / sfactor + yMin;
          	  verts[j+2] = ((zMax - zMin) * getXYZ(chunk, i+6)) / sfactor + zMin;
            
      	      if(cols){
        	      cols[j] = getRGB(chunk, i+9) / 255;
          	    cols[j+1] = getRGB(chunk, i+10) / 255;
            	  cols[j+2] = getRGB(chunk, i+11) / 255;
            	}
      	    }
          }
          
          
          var attributes = {};
          if(verts){attributes["ps_Vertex"] = verts;}
          if(cols){attributes["ps_Color"] = cols;}
          //if(norms){attributes["ps_Normal"] = norms;}
          
          parse(AJAX.parser, attributes);

        }
      };
      
      AJAX.firstLoad = function(textData){
        var chunkLength = textData.length;
          
        var temp;
        
        //numPtStr
        tagExists = textData.indexOf(numPtStr);
        if(tagExists !== -1){
          endTagExists = textData.indexOf(endXMLStr, tagExists);
          temp = textData.substring((tagExists + numPtStr.length), endTagExists);
          var numPtArr = temp.split(" ");
          numTotalPoints = numPtArr[1] * 1;
        }
        
        //sptSzStr
        
        //posMinStr
        tagExists = textData.indexOf(posMinStr);
        if(tagExists !== -1){
          endTagExists = textData.indexOf(endXMLStr, tagExists);
          temp = textData.substring((tagExists + posMinStr.length), endTagExists);
          var posMinArr = temp.split(" ");
          xMin = posMinArr[1] * 1;
          yMin = posMinArr[2] * 1;
          zMin = posMinArr[3] * 1;
        }
        
        //posMaxStr
        tagExists = textData.indexOf(posMaxStr);
        if(tagExists !== -1){
          endTagExists = textData.indexOf(endXMLStr, tagExists);
          temp = textData.substring((tagExists + posMaxStr.length), endTagExists);
          var posMaxArr = temp.split(" ");
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
          
          endTag = "</Level>";
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
          
          var totalPointsInBytes = (numTotalPoints * 12) + infoStart;
          
          // if the status just changed and we finished downloading the
          // file, grab everyting until the end. If there is only a bunch
          // of whitespace, make a note of that and don't bother parsing.
          /*if(AJAX.readyState === XHR_DONE){
            var chunk = textData.substring(AJAX.startOfNextChunk, infoEnd);
            AJAX.parseChunk(chunk);
            // If the last chunk doesn't have any digits (just spaces)
            // don't parse it.
            //if(chunk.match(/[0-9]/)){
            //  AJAX.parseChunk(chunk);
            //}
          }
          // handles parsing up to the end of position and colors
          else*/ if((totalPointsInBytes > AJAX.startOfNextChunk) && (totalPointsInBytes < AJAX.last12Index)){
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
        }//AJAX.responseText
      };//onprogress
      
      // open an asynchronous request to the path
      AJAX.open("GET", path, true);
      AJAX.overrideMimeType('text/plain; charset=x-user-defined');
      AJAX.send(null);
    };// load
  }//ctor
  return PSIParser;
}());
