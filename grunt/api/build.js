"use strict";


module.exports = function (grunt) {
	var opt = this;
	var _ = require('lodash');

	this
		.clean([
			opt.BUILD + '/api/controllers',
			opt.BUILD + '/api/models',
			opt.BUILD + '/api/index.php',
			opt.BUILD + '/api/.htaccess'
		])

		.copy({
			options: {
				excludeEmpty: true
			},
			files: [{
				expand: true,
				cwd: opt.SRC + '/api/',
				src: [
					'**/*.php',
					'.htaccess',
					'index.php'
				],
				dest: opt.BUILD + '/api/'
			}]
		})

		.findPhpClasses({
			options: {
				cwd: opt.BUILD + '/api/',
				src: [
					'controllers/**/*.php',
					'lib/**/*.php',
					'models/**/*.php'
				],
				beauty: false,
				outputJSON: opt.VAR + '/classes/api.json'
			}
		});

	this.add([
		"api/specs"
	]);

};