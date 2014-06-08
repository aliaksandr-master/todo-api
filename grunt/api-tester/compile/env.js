"use strict";

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this

		.copy({
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