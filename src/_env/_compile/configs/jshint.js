"use strict";
module.exports = function(grunt){

	return {
		options: grunt.file.readJSON('.jshintrc'),
		env: {
			src: [
				'src/_env/**/*.js',
				'src/_env/*.js'
			]
		}

	};
};