'use strict';

module.exports = function(grunt){

	var pkg = grunt.file.readJSON('package.json');

	return {
//		EXT_BLOB_IMAGE: ['png', 'jpg', 'jpeg', 'gif', 'PNG', 'GIF', 'JPEG', 'JPG'],
//		EXT_BLOG_ICON: ['ICO', 'ico'],
//		EXT_VECTOR_IMAGE: ['svg', 'SVG'],
//		EXT_FONTS: ['woff', 'otf', 'ttf', 'svg'],
//		EXT_STATIC: ['hbs', 'js', 'css', 'less', ''],
//
		cacheKey: "-"+Date.now(),
		package: pkg,
		liveReload: {
			port: 35729,
			src: '//www.' + pkg.name + ':35729/livereload.js'
		}
	};
};