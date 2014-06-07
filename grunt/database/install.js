"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.MySQLDbSchema({
		files: [{
			expand: true,
			cwd: opt.DEV + '/database/configs/',
			src: '**/*.json',
			dest: opt.VAR + '/database/scheme/'
		}]
	});
};