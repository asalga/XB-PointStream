var ps_include = ((function(lastScript) { 
  return (function(path) {
    var fullUrl = lastScript.src.substring(0, lastScript.src.lastIndexOf('/') + 1) + path; 
    var newScript = document.createElement("script"); 
    newScript.src = fullUrl; 
    document.getElementsByTagName("head")[0].appendChild(newScript);
  });
})(document.getElementsByTagName("head")[0].lastChild));

ps_include('mjs.js');
ps_include('psapi.js');
