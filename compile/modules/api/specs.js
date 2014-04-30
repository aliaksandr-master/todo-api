"use strict";

module.exports = function (grunt) {
	var path = this.path;

	var _ = require('lodash');
	var sha1 = require('sha1');
	var json2php = require(path.COMPILE + "/utils/json2php.js");

	this.config('jshint', {
		src: [
			path.SRC + '/api/controllers/**/*.spec.{js,json}'
		]
	});

	this.config('api-specs-compiler', {
		options: _.extend({
			beauty: false,
			verbose: false
		}, require(path.SRC + '/api/controllers/spec.options.js')),

		files: [
			{
				expand: true,
				flatten: true,
				cwd: path.SRC + '/api/controllers',
				src: [
					'**/*.spec.{json,raml,yaml,js}'
				],
				ext: '.json',
				dest: path.TMP + '/api/specs/'
			}
		]

	});

	this.config('split-files:specs', {
		options: {
			process: function (content, fpath, dest, fileObj) {
				var result = {};

				var destDir = fileObj.orig.dest.replace(/\/$/, '');

				_.each(content, function (obj, key) {
					result[destDir + '/' + sha1(key) + '.php'] = '<?php \nreturn ' + json2php(obj) + ';\n?>';
				});

				return result;
			}
		},

		files: [{
			expand: true,
			cwd: path.TMP + '/api-specs/',
			src: [
				'**/*.json'
			],
			dest: path.BUILD + '/api/var/specs/'
		}]
	});

	this.config('split-files:methods-config', {
		options: {
			process: function (content, fpath, dest, fileObj) {
				var result = {};

				result[dest] = '<?php \nreturn ' + json2php(content.methods) + ';\n?>';

				return result;
			}
		},
		files: [
			{
				src: path.SRC + '/api/specs-options.js',
				dest: path.BUILD + '/api/var/configs/' + sha1('methods') + '.php'
			}
		]
	});
};