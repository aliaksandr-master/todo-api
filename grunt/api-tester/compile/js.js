"use strict";

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this
		.clean([
			opt.BUILD + '/api-tester/inc/js',
			opt.BUILD + '/api-tester/static/js'
		])

		.jshint({
			src: [
				opt.SRC + '/api-tester/**/*.{js,json}'
			]
		})

		.copy({
			options: {
				excludeEmpty: true
			},
			files: [{
				expand: true,
				cwd: opt.SRC + '/api-tester',
				src: [
					'inc/js/**/*.js',
					'static/js/**/*.js'
				],
				dest: opt.BUILD + '/api-tester'
			}]
		});

};