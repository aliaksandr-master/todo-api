"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.clean([
		opt.BUILD + '/client/content/'
	]);

	this.add(['client-content-compile']);

	this.copy({
		options: { excludeEmpty: true },
		files: [{
			expand: true,
			cwd: opt.SRC + "/client/content/",
			src: '**/*.{png,jpg,jpeg,gif,svg}',
			dest: opt.BUILD + "/client/content/"
		}]
	});

};