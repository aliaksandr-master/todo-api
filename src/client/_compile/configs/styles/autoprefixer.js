"use strict";
module.exports = function(grunt){

	return {
		options: {
			browsers: ['last 2 version', 'ie 9'],
			diff: false,
			map: false
		},
		'client-styles': {
			expand: true,
			overwrite: true,
			src: [
				global.BUILD + '/client/static/styles/*.css',
				global.BUILD + '/client/static/styles/**/*.css',
				global.BUILD + '/client/static/styles/**/*.css',
				global.BUILD + '/client/static/vendor/**/*.css',
				global.BUILD + '/client/static/vendor/*.css'
			]
		}
	};
};