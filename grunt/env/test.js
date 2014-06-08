'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

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