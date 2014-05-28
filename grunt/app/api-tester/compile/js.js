"use strict";

module.exports = function (grunt) {
	var opt = this;

	this
		.run('clean', [
			opt.BUILD + '/api-tester/inc/js',
			opt.BUILD + '/api-tester/static/js'
		])

		.run('jshint', {
			src: [
				opt.SRC + '/api-tester/**/*.{js,json}'
			]
		})

		.run('copy', {
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