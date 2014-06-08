'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

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