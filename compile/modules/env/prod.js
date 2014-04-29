"use strict";
module.exports = function (grunt) {
	var path = this.path;

	this.config('copy', {
		files: [
			{
				expand: true,
				cwd: path.BUILD,
				src: [
					'**/*', '*'
				],
				dest: path.DEPLOY
			},
			{
				expand: true,
				cwd: path.COMPILE + "/env/prod/",
				src: [
					'**/*', '*'
				],
				dest: path.DEPLOY
			}
		]
	});

};