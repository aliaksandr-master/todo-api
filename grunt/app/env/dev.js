"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.run('copy', {
		files: [
			{
				expand: true,
				cwd: opt.BUILD,
				src: [
					'**/*', '*'
				],
				dest: opt.DEPLOY
			},
			{
				expand: true,
				cwd: opt.GRUNT + "/assets/env/dev/",
				src: [
					'**/*', '*'
				],
				dest: opt.DEPLOY
			}
		]
	});

};