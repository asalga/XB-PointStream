#!/bin/tcsh

# The following arguments are used when generating the documentation.
#
# -v (verbose) = Displays what the tool is doing on the console.
#
# -t (template) = The template used.
#
# -d (destination) = The directory where the generated files should be placed.

set xbps=$PWD
set jsd=$xbps

# Instead of having to force users to set paths, we take
# care if this script is called from make or directly by the user
if($#argv == 1) then
	set jsd=${xbps}/tools/jsdoc-toolkit
else
	set xbps=$xbps/../../
endif

#
java -jar $jsd/jsrun.jar $jsd/app/run.js -a -v -t=$jsd/templates/jsdoc -d=$xbps/docs/ $xbps/psapi.js $xbps/parsers/asc.js
