"use strict";

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this.copy({
		files: [
			{
				expand: true,
				cwd: this.lnk(opt.SRC, 'static'),
				src: [
					'**/*.{html,htm,xhtml}',
					'*.{html,htm,xhtml}'
				],
				dest: this.lnk(opt.BUILD, 'static'),
				ext: '.html'
			}
		]
	});

	this.replace({
		overwrite: true,
		src: [
			opt.lnk(opt.BUILD, 'static/index.html')
		],
		replacements: [{
			from: 'static/',
			to: 'static-' + opt.build.timestamp + '/'
		}]
	});

};