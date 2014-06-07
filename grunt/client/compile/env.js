"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.copy({
		options: {
			excludeEmpty: true
		},

		files: [{
			src: opt.SRC + '/client/.htaccess',
			dest: opt.BUILD + '/client/.htaccess'
		}]
	});

};