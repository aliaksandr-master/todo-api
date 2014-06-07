"use strict";

module.exports = function (grunt) {
	var opt = this;

	var _ = require('lodash');

	var src = opt.lnk(opt.SRC);
	var build = opt.lnk(opt.BUILD);

	var configs = {
		config: opt,
		options: opt,
		package: opt.package || {},
		build: opt.build || {}
	};

	this.jshint({
		src: [
			src + '/static/js/**/*.js',
			src + '/static/*.js'
		]
	});

	this.clean([
		build + '/js/**/*.js',
		build + '/js/main.js',
		build + '/js/config.js'
	]);

	this.copy({
		files: [{
			expand: true,
			cwd: src + "/static/js/",
			src: '**/*.js',
			dest: build + "/static/js/"
		}]
	});

	this.replace({
		src: [
			build + '/static/**/*.{js,html,css}'
		],
		overwrite: true,
		replacements: [{
			from: /\$\{(config|build|options|package):([^\}]+)\}/g,
			to: function (word, _i, _f, matches) {
				var config = configs[matches[0]],
					name = matches[1],
					value = _.reduce(name.split('.'), function(config, name) {
						return config != null ? config[name] : null;
					},config);

				if (value == null) {
					console.error('Configuration variable "' + name + '" is not defined in config files!');
					grunt.fail();
				}
				return value;
			}
		}]
	});



};