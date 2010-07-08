var ps_include = function(path) {
  document.write('<' + 'script');
  document.write(' language="javascript"');
  document.write(' type="text/javascript"');
  document.write(' src="' + path + '">');
  document.write('</' + 'script' + '>');
}

ps_include('mjs.js');
ps_include('psapi.js');
