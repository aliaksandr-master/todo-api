"use strict";

module.exports = function (grunt) {
	var opt = this;

	this

		.clean([
			opt.BUILD + '/api-tester/static/templates'
		])

		.copy({
			options: {
				excludeEmpty: true
			},
			files: [{
				expand: true,
				cwd: opt.SRC + '/api-tester',
				src: [
					'static/templates/**/*.hbs'
				],
				dest: opt.BUILD + '/api-tester'
			}]
		});
};