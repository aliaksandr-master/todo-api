"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.run('copy', {
		options: {
			excludeEmpty: true
		},

		files: [
			{
				src: this.SRC + '/client/.htaccess',
				dest: this.BUILD + '/client/.htaccess'
			}
		]
	});

};