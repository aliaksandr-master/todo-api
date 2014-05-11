"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.run('copy', {
		files: [
			{
				expand: true,
				cwd: opt.SRC + "/client/static/",
				src: [
					'**/*.{html,htm,xhtml}',
					'*.{html,htm,xhtml}'
				],
				dest: opt.BUILD + "/client/static/",
				ext: '.html'
			}
		]
	});

	this.run('replace', {
		overwrite: true,
		src: [
			opt.BUILD + '/client/static/index.html'
		],
		replacements: [{
			from: 'static/',
			to: 'static-' + opt.buildTimestamp + '/'
		}]
	});

};