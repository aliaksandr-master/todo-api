"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.run('clean', [
		opt.BUILD + '/api'
	]);

};