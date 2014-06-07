"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.clean([
		opt.BUILD + '/api'
	]);

};