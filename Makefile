# XB PointStream Makefile
#
# You must specify a version when running make:
# make VERSION=0.1

# create a clean release directory and copy in the release documents
release: create-release-dir create-release-files

VERSION ?= $(error Specify a version for your release (e.g., make VERSION=0.1))

# final files to release
create-release-files: create-release-docs create-user-docs minify create-example zip-min

# Minification strips out comments and most whitespace
minify: create-release-dir
	cat psapi.js ./libs/mjs.js ./parsers/asc.js ./parsers/pts.js ./parsers/psi.js ./parsers/ply.js ./parsers/psi2.js ./parsers/hps0.js > ./xbps-min/xbps-temp.js
	rm -fr tools-bin
	mkdir tools-bin/
	cc -o tools-bin/minifier tools/jsmin.c
	./tools-bin/minifier < ./xbps-min/xbps-temp.js > ./xbps-min/xbps-min-${VERSION}.js
	rm ./xbps-min/xbps-temp.js
	rm -fr ./tools-bin

#
zip-min: minify
	zip -r ./xbps-min/xbps-min-${VERSION}.zip ./xbps-min
	mv ./xbps-min/xbps-min-${VERSION}.js .
	mv ./xbps-min/xbps-min-${VERSION}.zip .
	rm -fr ./xbps-min
	mkdir ./xbps-min
	mv xbps-min-${VERSION}.js  ./xbps-min/xbps-min-${VERSION}.js
	mv xbps-min-${VERSION}.zip ./xbps-min/xbps-min-${VERSION}.zip

# Create a simple example
create-example: create-release-dir
	mkdir ./xbps-min/clouds
	cp ./clouds/acorn.asc ./xbps-min/clouds
	echo "<html>" > ./xbps-min/example.html
	echo "  <head>" >> ./xbps-min/example.html
	echo "    <script src=\"xbps-min-${VERSION}.js\"></script>" >> ./xbps-min/example.html
	echo "    <script src=\"example.js\"></script>" >> ./xbps-min/example.html
	echo "  </head>" >> ./xbps-min/example.html
	echo "  <body onLoad=\"start();\">" >> ./xbps-min/example.html
	echo "    <canvas id=\"canvas\" style=\"border: 1px solid black;\" width=\"400\" height=\"400\"></canvas>" >>./xbps-min/example.html
	echo "    <pre>" >> ./xbps-min/example.html
	cat example.js >> ./xbps-min/example.html
	echo "    </pre>" >> ./xbps-min/example.html
	echo "  </body>" >> ./xbps-min/example.html
	echo "</html>" >> ./xbps-min/example.html
	cp example.js ./xbps-min/

# Create user documentation
create-user-docs: create-release-dir
	./tools/jsdoc-toolkit/gendocs.sh 0

# Copy over the documents into the release directory
create-release-docs: create-release-dir
	cp AUTHORS ./xbps-min
	cp README.md ./xbps-min
	cp LICENSE ./xbps-min

#
create-release-dir: clean
	mkdir ./xbps-min/

# remove the release directory and its contents
clean:
	rm -fr ./xbps-min/
