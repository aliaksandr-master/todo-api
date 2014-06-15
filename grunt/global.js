'use strict';

module.exports = function (grunt) {
	var opt = this;

	this
		.options('jshint',
			grunt.file.readJSON(opt.CWD + '/.jshintrc'),
		true)

		.options('autoprefixer', {
			browsers: ['last 2 version', 'ie 9'],
			diff: false,
			map: false
		}, true)

		.options('watch', {
			livereload: true,
			interrupt: true
		}, true)

	;
};