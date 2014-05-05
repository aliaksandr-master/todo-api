"use strict";

module.exports = function (grunt) {
	var path = this.path;

	this.config('watch', {
		files: [
			path.SRC + "/opt/**/*.php"
		],
		tasks: [
			'copy:opt/install',
			'pragma'
		]
	});

};