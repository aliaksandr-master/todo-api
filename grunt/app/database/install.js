"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.run('mysql-schema', {
		files: [
			{
				expand: true,
				cwd: opt.DEV + '/configs/database/',
				src: '**/*.json',
				dest: opt.VAR + '/database/scheme/'
			}
		]
	});
};