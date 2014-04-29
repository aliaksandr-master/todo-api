"use strict";

module.exports = function (grunt) {
	var path = this.path;

	this.config('json-merge', {
		options: {
			outputJSON: 'api.source.json'
		},
		files: [
			{
				expand: true,
				cwd: path.TMP + '/api/specs-source',
				src: '**/*.json',
				dest: path.BUILD + '/api-test/var'
			}
		]
	});


};
