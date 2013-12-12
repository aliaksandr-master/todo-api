module.exports = function(grunt){
	var pkg = grunt.file.readJSON('package.json');

	return {
		cacheKey: Date.now(),
		pkg: pkg,
		liveReload: {
			port: 35729,
			fileUrl: '//www.'+pkg.name+':35729/livereload.js'
		}
	};
};