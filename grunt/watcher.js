"use strict";

module.exports = function (grunt) {

	this.options('watch', {
		debounceDelay: 250,
		livereload: true,
		interrupt: true,
		reload: true
	}, true);

};