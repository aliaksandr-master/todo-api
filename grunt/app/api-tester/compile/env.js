"use strict";

module.exports = function (grunt) {
	var opt = this;

	this

		.run('copy', {
			options: {
				excludeEmpty: true
			},
			files: [{
				expand: true,
				cwd: opt.SRC + '/api-tester',
				src: [
					'.htaccess',
					'index.php',
				],
				dest: opt.BUILD + '/api-tester'
			}]
		});
};