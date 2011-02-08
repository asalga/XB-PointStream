/*
*/

var Your_Parser_Name = (function() {

  function Your_Parser_Name(config) {

    this.__defineGetter__("version", function(){
      return /* !! */;
    });

    this.__defineGetter__("numParsedPoints", function(){
      return /* !! */;
    });
    
    this.__defineGetter__("numTotalPoints", function(){
      return /* !! */;
    });

    this.__defineGetter__("progress", function(){
      return /* !! */;
    });
    
    this.__defineGetter__("fileSize", function(){
      return /* !! */;
    });
    
    /**
      @param path Path to the resource
    */
    this.load = function(path){
      pathToFile = path;

      AJAX = new XMLHttpRequest();
      
      AJAX.parser = this;

      AJAX.onloadstart = function(evt){
        start(AJAX.parser);
      };
      
      AJAX.onload = function(evt){
        end(AJAX.parser);
      }
      
      AJAX.parseChunk = function(chunkData){
        var attributes = {};
        attributes["ps_Vertex"] = /* !! */;
        attributes["ps_Color"] = /* !! */;

        parse(AJAX.parser, attributes);
      };
    
      AJAX.onprogress = function(evt){
      };
      
      // open an asynchronous request to the path
      AJAX.open("GET", path, true);
      AJAX.send(null);
    };
  }
  return Your_Parser_Name;
}());
