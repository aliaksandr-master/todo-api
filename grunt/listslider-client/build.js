'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this.include([
		NAME + '/compile/env',
		NAME + '/compile/lang',
		NAME + '/compile/image',
		NAME + '/compile/style',
		NAME + '/compile/html',
		NAME + '/compile/script',
		NAME + '/compile/template',
		NAME + '/compile/router'
	]);

};