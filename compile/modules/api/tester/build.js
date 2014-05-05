"use strict";

module.exports = function (grunt) {
	var path = this.path;
	var _ = require('lodash');

	this

		.config('json-process', {
			options: {
				beautify: true
			},
			files: [{
				src: path.TMP + '/api/specs-merged.json',
				dest: path.BUILD + '/api-test/var/specs.json'
			}]
		});
};
