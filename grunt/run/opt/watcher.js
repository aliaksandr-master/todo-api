"use strict";

module.exports = function (grunt) {
	var path = this;

	this.run('watch', {
		files: [
			path.SRC + "/opt/**/*.php"
		],
		tasks: [
			'copy:opt/install',
			'pragma'
		]
	});

};