"use strict";
module.exports = function(grunt){

	return {
		options: grunt.file.readJSON('.jshintrc'),

		check : {
			src: [
				'_src/client/js/**/*.js',
				'_src/client/js/*.js',
				'_src/client/*.js',
				'_src/grunt/**/*.js',
				'_src/grunt/*.js',
				'_src/environment/**/*.js',
				'_src/environment/*.js',
				'Gruntfile.js'
			]
		}

	};
};