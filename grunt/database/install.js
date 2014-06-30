'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this
		.MySQLDbSchema({
			options: {
				verboseRaw: opt.VAR + '/database/scheme-raw/'
			},
			files: [{
				expand: true,
				cwd: opt.DEV + '/database/configs/',
				src: '**/*.json',
				dest: opt.VAR + '/database/scheme/'
			}]
		})
	;
};