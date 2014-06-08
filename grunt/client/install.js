"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.clean([
		opt.BUILD + '/client'
	]);

	this.copy({
		files: [{
			expand: true,
			cwd:  opt.OPT + '/frontend/vendor',
			src: '**/*',
			dest: opt.BUILD + '/client/static/vendor'
		}]
	});

};