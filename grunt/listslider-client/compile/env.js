'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this.copy({
		options: {
			excludeEmpty: true
		},

		files: [{
			src: SRC + '/.htaccess',
			dest: BUILD + '/.htaccess'
		}]
	});

};