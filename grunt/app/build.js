"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.options('jshint', grunt.file.readJSON(opt.CWD + '/.jshintrc'), true);

	this.run('pragma:php', {
		options: {
			processors: {
				injectData: function (pragma, fpath) {
					var json2php = opt.utils.json2php;

					var jsonFile = pragma.params[0].replace(/@([A-Z]+)/g, function (word, name) {
						if (opt[name] === undefined) {
							throw new Error('@' + name + ' is undefined');
						}
						return opt[name];
					});
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
		files: [{
			expand: true,
			cwd: opt.BUILD,
			src: [
				'**/*.php'
			],
			dest: opt.BUILD
		}]
	}, false);

	this.run('copy:htaccess', {
		files: [{
			src: opt.SRC + '/.htaccess',
			dest: opt.BUILD + '/.htaccess'
		}]
	}, false);

	this.add([
		'api/build',
		'api-tester/build',
		'client/build',
		'pragma:build/php',
		'copy:build/htaccess'
	]);
};