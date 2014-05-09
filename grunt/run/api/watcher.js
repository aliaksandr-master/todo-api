"use strict";

module.exports = function (grunt) {
	var path = this;

	this.run('watch:specs', {
		files: [
			path.SRC + '/api/**/*.spec.{json,js}'
		],
		tasks: [
			'api/specs'
		]
	});

	this.run('watch:php', {
		files: [
			path.SRC + '/api/**/*.php'
		],
		tasks: [
			'api/build',
			'pragma'
		]
	});

};