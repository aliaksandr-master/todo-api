"use strict";
module.exports = function(grunt){

	return {
		options: grunt.file.readJSON('.jshintrc'),
		api: {
			src: [
				'_src/api/**/*.js',
				'_src/api/*.js',
				'_src/api/**/*.json',
				'_src/api/*.json'
			]
		},
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