"use strict";
module.exports = function(grunt){

	return {
		options: grunt.file.readJSON('.jshintrc'),
		api: {
			src: [
				'src/api/**/*.js',
				'src/api/*.js',
				'src/api/**/*.json',
				'src/api/*.json'
			]
		},
		check : {
			src: [
				'src/client/js/**/*.js',
				'src/client/js/*.js',
				'src/client/*.js',
				'src/grunt/**/*.js',
				'src/grunt/*.js',
				'src/environment/**/*.js',
				'src/environment/*.js',
				'Gruntfile.js',
				'!src/grunt/utils.js'
			]
		}

	};
};