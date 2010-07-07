function include(script) {
    document.write('<' + 'script');
    document.write(' language="javascript"');
    document.write(' type="text/javascript"');
    document.write(' src="' + script + '">');
    document.write('</' + 'script' + '>');
}

include('mjs.js');
include('psapi.js');