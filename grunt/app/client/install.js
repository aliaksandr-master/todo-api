"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.run('clean', [
		opt.BUILD + '/client'
	]);

	this.run('bower', {
		options: {
			install: true,
			verbose: true,
			layout: 'byType',
			targetDir: opt.BUILD + '/client/static/vendor',
			cleanBowerDir: false,
			cleanTargetDir: true
		}
	});

	this.run('copy', {
		files: [{
			expand: true,
			cwd: opt.SRC + "/client/static/vendor",
			src: '**/*',
			dest: opt.BUILD + "/client/static/vendor"
		}]
	});

};