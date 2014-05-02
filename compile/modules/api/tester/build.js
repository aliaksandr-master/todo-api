"use strict";

module.exports = function (grunt) {
	var path = this.path;

	this.config('json-merge', {
		options: {
			outputJSON: path.BUILD + '/api-test/var/api.source.json'
		},
		files: [{
			src: this.TMP + '/api/specs-merged.json',
			dest: path.BUILD + '/api-test/var/specs.json'
		}]
	});

};
