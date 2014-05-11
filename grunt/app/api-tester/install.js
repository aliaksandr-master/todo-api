"use strict";

module.exports = function (grunt) {
	var opt = this;

	this
		.run('clean', [
			opt.BUILD + '/api-tester'
		])

		.run('copy', {
			options: {
				excludeEmpty: true
			},
			files: [{
				expand: true,
				cwd: opt.SRC + '/api-tester',
				src: [
					'static/**/*',
					'vendor/**/*',
					'*php',
					'**/.htaccess'
				],
				dest: opt.BUILD + '/api-tester'
			}]
		});
};
