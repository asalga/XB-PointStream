"""
Andor Salga

This script will take an ASC file, evenly distribute the
points and separate the cloud into a series of files.
"""

import random
import sys

#
# Usage: python lod.py pointCloud.asc 4
if (len(sys.argv) < 4):
  print "Usage: python lod.py pointcloud.asc outFileName [numLevels]\n"
else:
  inFileName = sys.argv[1];
  outBaseFileName = sys.argv[2];

  arr = []
  file = open(inFileName)
  while 1:
    line = file.readline()
    arr.append(line)
    if not line: break 
  file.close()

  random.shuffle(arr);

  # Find out how many points we are going to have per
  # file. Don't worry about rounding issues. We will simply
  # append the remaining points to the last cloud.
  numFiles = int(sys.argv[3])
  pointsPerFile = len(arr)/numFiles

  nextFile = 0
  outFilename = outBaseFileName + "_0.asc"

  FILE = open(outFilename, "w")

  line = 0
  
  for item in arr:
    FILE.write(str(item)[0 : -1] + "\n")
    if(line > 0 and (line % pointsPerFile == 0 and nextFile+1 != numFiles )):
      FILE.close()
      nextFile += 1
      outFilename = outBaseFileName + "_" + str(nextFile) + ".asc"
      FILE = open(outFilename, "w")
    line += 1  
  FILE.close()
