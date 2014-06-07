"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.include([
		this.lnk(null, 'install'),
		this.lnk(null, 'build')
	]);

};