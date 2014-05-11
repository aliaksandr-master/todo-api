"use strict";

module.exports = function (grunt) {
	var opt = this;

	this
		.run('clean', [
			opt.BUILD + '/api-test'
		])

		.run('copy', {
			options: {
				excludeEmpty: true
			},
			files: [{
				expand: true,
				cwd: opt.SRC + '/opt/api-test',
				src: [
					'**/*.{php,html,htaccess,hbs,js,css,eot,svg,ttf,woff,otf}',
					'**/.htaccess'
				],
				dest: opt.BUILD + '/api-test'
			}]
		});
};
