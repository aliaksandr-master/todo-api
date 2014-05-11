"use strict";

module.exports = function (grunt) {
	var opt = this;

	var _ = require('lodash');

	var configs = {
		config: opt,
		options: opt,
		package: opt.package || {},
		build: opt.build || {}
	};

	this.run('jshint', {
		src: [
			opt.SRC + '/client/static/js/**/*.js',
			opt.SRC + '/client/static/*.js'
		]
	});

	this.run('clean', [
		opt.BUILD + '/client/js/**/*.js',
		opt.BUILD + '/client/js/main.js',
		opt.BUILD + '/client/js/config.js'
	]);

	this.run('copy', {
		files: [{
			expand: true,
			cwd: opt.SRC + "/client/static/js/",
			src: '**/*.js',
			dest: opt.BUILD + "/client/static/js/"
		}]
	});

	this.run('replace', {
		src: [
			opt.BUILD + '/client/static/js/**/*.{js,html,css}',
			opt.BUILD + '/client/static/*.{js,html,css}'
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