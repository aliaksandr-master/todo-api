"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.copy({
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
				cwd: opt.GRUNT + "/_assets/env/test/",
				src: [
					'**/*', '*'
				],
				dest: opt.DEPLOY
			}
		]
	});

};