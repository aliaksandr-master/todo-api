'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	var _ = require('lodash');

	var configs = {
		module: {
			NAME: NAME,
			BUILD: BUILD,
			SRC: SRC
		},
		config: opt,
		options: opt,
		package: opt.package,
		build: opt.build
	};

	this
		.jshint({
			src: [
				SRC + '/static/js/**/*.js',
				SRC + '/static/*.js'
			]
		})

		.clean([
			BUILD + '/js/**/*.js',
			BUILD + '/js/main.js',
			BUILD + '/js/config.js'
		])

		.copy({
			files: [{
				expand: true,
				cwd: SRC + '/static/js/',
				src: '**/*.js',
				dest: BUILD + '/static/js/'
			}]
		})

		.replace({
			src: [
				BUILD + '/static/**/*.{js,html,css}'
			],
			overwrite: true,
			replacements: [{
				from: /\$\{(config|build|options|module|package):([^\}]+)\}/g,
				to: function (word, _i, _f, matches) {
					var config = configs[matches[0]],
						name = matches[1],
						value = _.reduce(name.split('.'), function(config, name) {
							return config != null ? config[name] : null;
						},config);

					if (value == null) {
						grunt.fail.fatal(_f + 'Configuration variable "' + name + '" is not defined in config files!');
						grunt.fail();
					}
					return value;
				}
			}]
		})
	;

};