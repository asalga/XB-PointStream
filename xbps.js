/*
*/
var ps_include = function(path){
  var lastScript = document.getElementsByTagName("head")[0].lastChild;
  var fullUrl = lastScript.src.substring(0, lastScript.src.lastIndexOf('/') + 1) + path;
  document.write('<' + 'script');
  document.write(' language="javascript"');
  document.write(' type="text/javascript"');
  document.write(' src="' + fullUrl + '">');
  document.write('</' + 'script' + '>');
}


ps_include('psapi.js');
ps_include('./libs/mjs.js');
ps_include('./parsers/asc.js');
ps_include('./parsers/psi.js');
ps_include('./parsers/pts.js');
ps_include('./parsers/ply.js');
ps_include('./parsers/hps0.js');
ps_include('./parsers/psi2.js');