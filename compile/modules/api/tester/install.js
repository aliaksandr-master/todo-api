"use strict";

module.exports = function (grunt) {
	var path = this.path;

	this
		.config('clean', [
			path.BUILD + '/api-test'
		])

		.config('copy', {
			options: {
				excludeEmpty: true
			},
			files: [
				{
					expand: true,
					cwd: path.SRC + '/opt/api-test',
					src: [
						'**/*.{php,html,htaccess,hbs,js,css,eot,svg,ttf,woff,otf}',
						'**/.htaccess'
					],
					dest: path.BUILD + '/api-test'
				}
			]
		});
};
