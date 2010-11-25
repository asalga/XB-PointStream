# XB PointStream Makefile
#

# create a clean release directory and copy in the
# release documents
all: release

#
release: create-release-dir create-release-files

# final files to release
create-release-files: create-release-docs examples pretty-zipped

# Minification strips out comments and most whitespace
minified: create-release-dir
	cc -o tools/minifier tools/jsmin.c
	./tools/minifier < psapi.js > ./release/psapi-min.js
	./tools/minifier < parsers/asc.js > ./release/asc-min.js
	./tools/minifier < mjs.js > ./release/mjs-min.js
	cat ./release/psapi-min.js ./release/mjs-min.js ./release/asc-min.js > release/xbps-min.js
	rm ./release/psapi-min.js ./release/asc-min.js ./release/mjs-min.js

# 
pretty: 
	cat psapi.js mjs.js parsers/asc.js > release/xbps.js

#
pretty-zipped: pretty
	zip -r ./release/xbps.zip ./release/
	mv ./release/xbps.zip .
	rm -fr ./release
	mkdir ./release
	mv xbps.zip ./release/

# don't name this example
examples:
	mkdir ./release/clouds
	cp ./clouds/acorn.asc ./release/clouds/
	cp ./example.* ./release/

# Copy over the documents into the release directory
create-release-docs:
	cp AUTHORS ./release
	cp README ./release
	cp LICENSE ./release

# Create an empty release directory to store the release files
create-release-dir: clean
	mkdir ./release

# remove the release directory and its contents
clean:
	rm -fr ./release
