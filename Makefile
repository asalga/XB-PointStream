# XB PointStream Makefile
#

# create a clean release directory and copy in the
# release documents
all: release

#
release: create-release-dirs create-release-files

# final files to release
create-release-files: create-release-docs create-user-docs minify example-min zip-min

# Minification strips out comments and most whitespace
minify: create-release-dirs
	cat psapi.js mjs.js ./parsers/asc.js > ./xbps-min/xbps-temp.js
	rm -fr tools-bin
	mkdir tools-bin/
	cc -o tools-bin/minifier tools/jsmin.c
	./tools-bin/minifier < ./xbps-min/xbps-temp.js > ./xbps-min/xbps.js
	rm ./xbps-min/xbps-temp.js
	rm -fr ./tools-bin

#
zip-min: minify
	zip -r ./xbps-min/xbps-min.zip ./xbps-min
	mv ./xbps-min/xbps-min.zip .
	rm -fr ./xbps-min
	mkdir ./xbps-min
	mv xbps-min.zip ./xbps-min

# don't name this example
example-min: create-release-dirs
	mkdir ./xbps-min/clouds
	cp ./clouds/acorn.asc ./xbps-min/clouds
	cp ./example.* ./xbps-min

# Create user documentation
create-user-docs: create-release-dirs
	./tools/jsdoc-toolkit/gendocs.sh 0

# Copy over the documents into the release directory
create-release-docs: create-release-dirs
	cp AUTHORS ./xbps-min
#	cp AUTHORS ./xbps-all
	cp README ./xbps-min
#	cp README ./xbps-all/
	cp LICENSE ./xbps-min
#	cp LICENSE ./xbps-all

# Create two directories in a release directory
#
# all - Will contain the library merged into a single file
# min - above, but also minified
create-release-dirs: clean
	mkdir ./xbps-min/
#	mkdir ./xbps-all/

# remove the release directory and its contents
clean:
	rm -fr ./xbps-min/
#	rm -fr ./xbps-all/
