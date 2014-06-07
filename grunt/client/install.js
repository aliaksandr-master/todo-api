"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.clean([
		opt.BUILD + '/client'
	]);

	this.bower({
		options: {
			install: true,
			verbose: true,
			layout: 'byType',
			targetDir: opt.BUILD + '/client/static/vendor',
			cleanBowerDir: false,
			cleanTargetDir: true
		}
	});

	this.copy({
		files: [{
			expand: true,
			cwd:  opt.OPT + '/frontend/vendor',
			src: '**/*',
			dest: opt.BUILD + '/client/static/vendor'
		}]
	});

};