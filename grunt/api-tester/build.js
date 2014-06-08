"use strict";

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this.include([
		'api-tester/compile/env',
		'api-tester/compile/js',
		'api-tester/compile/styles',
		'api-tester/compile/templates',
		'api-tester/compile/page'
	]);
};
