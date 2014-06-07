"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.copy({
		options: {
			excludeEmpty: true
		},

		files: [{
			src: opt.lnk(opt.SRC, '.htaccess'),
			dest: opt.lnk(opt.BUILD, '.htaccess')
		}]
	});

};