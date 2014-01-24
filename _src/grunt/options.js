'use strict';

module.exports = function(grunt){

	var pkg = grunt.file.readJSON('package.json');

	return {
		cacheKey: "-"+Date.now(),
		package: pkg,
		liveReload: {
			port: 35729,
			src: '//www.' + pkg.name + ':35729/livereload.js'
		}
	};
};