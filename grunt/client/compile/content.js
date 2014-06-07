"use strict";

module.exports = function (grunt) {
	var opt = this;

	this
		.clean([
			opt.BUILD + '/client/content/'
		])

		.include('client-content-compile')

		.copy({
			options: { excludeEmpty: true },
			files: [{
				expand: true,
				cwd: opt.SRC + "/client/content/",
				src: '**/*.{png,jpg,jpeg,gif,svg}',
				dest: opt.BUILD + "/client/content/"
			}]
		})
	;

};