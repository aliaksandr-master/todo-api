"use strict";

module.exports = function (grunt) {
	var path = this.path;
	var _ = require('lodash');

	this

		.config('json-process', {
			options: {
				beautify: true,
				process: function (content, fpath, dest, fileObj) {
					var result = {};
					_.each(content, function (v, k) {
						if (!result[v.controller]) {
							result[v.controller] = {};
						}
						if (!result[v.controller][v.action]) {
							result[v.controller][v.action] = {};
						}
						result[v.controller][v.action] = v;
					});
					return result;
				}
			},
			files: [{
				src: path.TMP + '/api/specs-merged.json',
				dest: path.BUILD + '/api-test/var/specs.json'
			}]
		});
};
