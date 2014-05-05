"use strict";

module.exports = function (grunt) {
	var path = this.path;

	this.config('watch:specs', {
		files: [
			path.SRC + '/api/**/*.spec.{json,js}'
		],
		tasks: [
			'api/specs'
		]
	});

	this.config('watch:php', {
		files: [
			path.SRC + '/api/**/*.php'
		],
		tasks: [
			'api/build',
			'pragma'
		]
	});

};