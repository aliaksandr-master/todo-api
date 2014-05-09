"use strict";

module.exports = function (grunt) {
	var path = this;

	this.options('jshint', grunt.file.readJSON(path.CWD + '/.jshintrc'), true);

	this.run('pragma:php', {
		options: {
			processors: {
				injectData: function (pragma, fpath) {
					var json2php = require(path.GRUNT + '/utils/json2php.js');

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
				cwd: path.BUILD,
				src: [
					'**/*.php'
				],
				dest: path.BUILD
			}
		]
	}, false);

	this.run('copy', {
		files: [
			{
				src: path.SRC + '/.htaccess',
				dest: path.BUILD + '/.htaccess'
			}
		]
	}, false);

	this.add([
		'api/build',
		'api/tester/build',
//		'client/build',
		'pragma:build/php',
		'copy:build'
	]);
};