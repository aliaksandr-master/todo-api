"use strict";

module.exports = function (grunt) {
	var opt = this;
	var _ = require('lodash');

	this

		.run('json-process:specs', {
			options: {
				beautify: true
			},
			files: [{
				src: opt.TMP + '/api/specs-merged.json',
				dest: opt.BUILD + '/api-test/var/specs.json'
			}]
		})

		.run('json-process:routes', {
			options: {
				beautify: true
			},
			files: [{
				src: opt.TMP + '/api/router/routes.json',
				dest: opt.BUILD + '/api-test/var/routes.json'
			}]
		});
};
