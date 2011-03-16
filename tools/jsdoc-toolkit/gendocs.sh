#!/bin/bash

xbps=$PWD
jsd=$PWD

# Make will pass in a dummy variable
if [ $# -eq 1 ]
then
  jsd=$xbps/tools/jsdoc-toolkit
else
  xbps=$xbps/../../
fi

java -jar $jsd/jsrun.jar $jsd/app/run.js -a -v -t=$jsd/templates/jsdoc -d=$xbps/docs/ $xbps/psapi.js $xbps/parsers/asc.js $xbps/parsers/pts.js
