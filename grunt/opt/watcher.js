"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.watch({
		files: [
			opt.SRC + "/opt/**/*.php"
		],
		tasks: [
			'copy:opt/install',
			'pragma'
		]
	});

};