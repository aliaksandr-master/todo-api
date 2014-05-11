"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.run('watch', {
		files: [
			opt.SRC + '/api-tester/**/*',
			opt.SRC + '/api-tester/**/.*'
		],
		tasks: [
			'api-tester/install',
			'api-tester/build'
		]
	});

};