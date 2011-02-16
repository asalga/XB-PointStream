/*The following is a very simple parser written only to be used as 
  an example of how a user could write a parser for XB PointStream.*/
var Simple_Parser = (function() {

  function Simple_Parser(config) {
    this.__defineGetter__("version", function(){return /*!!!*/;});
    this.__defineGetter__("numParsedPoints", function(){return /*!!!*/;});
    this.__defineGetter__("numTotalPoints", function(){ return /*!!!*/;});
    this.__defineGetter__("progress", function(){ return /*!!!*/;});
    this.__defineGetter__("fileSize", function(){return /*!!!*/;});
    this.load = function(path){/*!!!*/};
  }
  return Simple_Parser;
}());
