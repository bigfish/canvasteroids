#!/usr/bin/bash
app-all.js:
	sencha create jsb -a index.html -p app.jsb3
	sencha build -p app.jsb3 -d .
	#../../bin/get_ext4_deps.pl index.html | xargs cat > asteroids.all.js
	#uglifyjs asteroids.all.js > asteroids.ugly.js
