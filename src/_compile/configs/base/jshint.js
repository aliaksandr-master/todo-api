"use strict";
module.exports = function(grunt){

	return {
		options: grunt.file.readJSON('.jshintrc'),
		base: {
			src: [
				'Gruntfile.js',
				'src/_compile/**/*.js',
				'src/_compile/*.js',
				'!src/_compile/utils.js'
			]
		}

	};
};