"use strict";

module.exports = function (grunt) {
	var opt = this;

	this

		.run('clean', [
			opt.BUILD + '/api-tester/static/styles'
		])

		.run('less', {
			files: [{
				expand: true,
				cwd: opt.SRC + '/api-tester',
				src: [
					'**/*.{less,css}',
					'!inc/**/*.{less,css}'
				],
				dest: opt.BUILD + '/api-tester',
				ext: '.css'
			}]
		});

};