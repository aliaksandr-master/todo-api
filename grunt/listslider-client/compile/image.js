'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this.clean([
		BUILD + '/images'
	]);

	this.copy({
		files: [
			{
				expand: true,
				cwd: SRC + '/static/',
				src: [
					'images/**/*.{png,jpg,jpeg,svg,gif,ico}',
					'images/*.{png,jpg,jpeg,gif,svg,ico}',
					'vendor/**/*.{png,jpg,jpeg,gif,svg,ico}',
					'vendor/*.{png,jpg,jpeg,gif,svg,ico}'
				],
				dest: BUILD + '/static/'
			},
			{
				src: SRC + '/static/favicon.ico',
				dest: BUILD + '/static/favicon.ico'
			}
		]
	});

};