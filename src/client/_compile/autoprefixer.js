"use strict";
module.exports = function(grunt){

	return {
		options: {
			browsers: ['last 2 version', 'ie 9'],
			diff: false,
			map: false
		},
		prefix: {
			expand: true,
			overwrite: true,
			src: [
				'client/styles/*.css',
				'client/styles/**/*.css',
				'client/styles/**/*.css',
				'client/vendor/**/*.css',
				'client/vendor/*.css'
			]
			// Target-specific file lists and/or options go here.
		}
	};
};