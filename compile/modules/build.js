"use strict";

module.exports = function (grunt) {
	var path = this.path;

	this.config('pragma:php', {
		options: {
			processors: {
				injectData: function (pragma, fpath) {
					var json2php = require(path.COMPILE + '/utils/json2php.js');

					var jsonFile = pragma.params[0];
					var resultData = grunt.file.readJSON(jsonFile);
					if (pragma.params[1]) {
						resultData = resultData[pragma.params[1]];
					}

					var ext = require('path').extname(fpath);

					if (ext === '.php') {
						resultData = json2php(resultData);
						return resultData;
					} else if (ext === '.js') {
						resultData = JSON.stringify(resultData, null, null);
						return resultData;
					}

					return null;
				}
			}
		},
		files: [
			{
				expand: true,
				cwd: path.BUILD + '/api/',
				src: [
					'**/*.php'
				],
				dest: path.BUILD + '/api/'
			}
		]
	}, false);

	this.config('copy:build', {
		files: [
			{
				src: path.SRC + '/.htaccess',
				dest: path.BUILD + '/.htaccess'
			}
		]
	}, false, false);

	this.alias([
		'api/build',
		'api/tester/build',
//		'client/build',
		'pragma:php'
	]);
};