"use strict";

module.exports = function (grunt) {
	var path = this;

	this.run('copy', {
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
				cwd: path.GRUNT + "/env/test/",
				src: [
					'**/*', '*'
				],
				dest: path.DEPLOY
			}
		]
	});

};