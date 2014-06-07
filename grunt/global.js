"use strict";

module.exports = function (grunt) {
	var opt = this;


	this.options('jshint',
		grunt.file.readJSON(opt.CWD + '/.jshintrc'),
	true);

	this.options('autoprefixer', {
		browsers: ['last 2 version', 'ie 9'],
		diff: false,
		map: false
	}, true);

	this.options('watch', {
		livereload: true,
		interrupt: true
	}, true);
};