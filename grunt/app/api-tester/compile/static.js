"use strict";

module.exports = function (grunt) {
	var opt = this;

	var _ = require('lodash');
	var mkobj = function (k, v) { var o = {}; o[k] = v; return o;};

	this.run('jade', {
		options: {
			client: false,
			amd: false,
			pretty: true,
			debug: false,
			filters: {},
			data: function () {
				return {};
			}
		},
		files: [{
			expand: true,
			src: [
				'**/*.jade'
			],
			cwd: opt.SRC + '/api-tester/jade',
			dest: opt.BUILD + '/api-tester',
			ext: '.html'
		}]
	});

	this.run('less', {
		files: [
			{
				expand: true,
				cwd: opt.SRC + '/api-tester/static/styles',
				src: [
					'**/*.less'
				],
				dest: opt.BUILD + '/api-tester/static/styles',
				ext: '.css'
			}
		]
	});

};