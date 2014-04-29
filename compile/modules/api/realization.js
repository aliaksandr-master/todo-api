"use strict";

module.exports = function (grunt) {
	var path = this.path;

	this.config('clean', [
		path.BUILD + '/api/controllers',
		path.BUILD + '/api/models',
		path.BUILD + '/api/index.php',
		path.BUILD + '/api/.htaccess'
	]);

	this.config('copy', {
		options: {
			excludeEmpty: true
		},
		files: [
			{
				expand: true,
				cwd: path.SRC + '/api/',
				src: [
					'controllers/**/*.php',
					'models/**/*.php',
					'.htaccess',
					'index.php'
				],
				dest: path.BUILD + '/api/'
			}
		]
	});

	this.config('find-php-classes', {
		options: {
			cwd: path.BUILD + '/',
			src: [
				'api/index.php',
				'api/controllers/**/*.php',
				'api/models/**/*.php',
				'opt/helpers/**/*.php',
				'opt/api/**/*.php',
				'opt/router/**/*.php'
			],
			beauty: false,
			outputJSON: path.TMP + '/classes/api.json'
		}
	});

	this.config('json2php', {
		files: [
			{
				src:  path.TMP + '/classes/api.json',
				dest: path.BUILD + '/api/var/classes.php'
			}
		]
	});
};