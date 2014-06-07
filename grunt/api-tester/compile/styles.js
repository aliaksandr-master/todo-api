"use strict";

module.exports = function (grunt) {
	var opt = this;

	this

		.clean([
			opt.BUILD + '/api-tester/static/styles'
		])

		.less({
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