"use strict";

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this.clean([
		opt.lnk(opt.BUILD, 'images')
	]);

	this.copy({
		files: [
			{
				expand: true,
				cwd: opt.lnk(opt.SRC, 'static'),
				src: [
					'images/**/*.{png,jpg,jpeg,svg,gif,ico}',
					'images/*.{png,jpg,jpeg,gif,svg,ico}',
					'vendor/**/*.{png,jpg,jpeg,gif,svg,ico}',
					'vendor/*.{png,jpg,jpeg,gif,svg,ico}'
				],
				dest: opt.lnk(opt.BUILD, 'static')
			},
			{
				src:  opt.lnk(opt.SRC, 'static/favicon.ico'),
				dest: opt.lnk(opt.BUILD, 'static/favicon.ico')
			}
		]
	});

};