#!/usr/bin/bash
asteroids.ugly.js:
	../../bin/get_ext4_deps.pl index.html | xargs cat > asteroids.all.js
	uglifyjs asteroids.all.js > asteroids.ugly.js
