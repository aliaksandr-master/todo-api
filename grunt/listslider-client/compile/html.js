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
				cwd: SRC + '/static',
				src: [
					'**/*.{html,htm,xhtml}',
					'*.{html,htm,xhtml}'
				],
				dest: BUILD + '/static',
				ext: '.html'
			}
		]
	});

	this.replace({
		overwrite: true,
		src: [
			BUILD + '/static/index.html'
		],
		replacements: [{
			from: 'static/',
			to: 'static-' + opt.build.timestamp + '/'
		}]
	});

};