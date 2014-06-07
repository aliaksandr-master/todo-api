"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.include([
		'client/compile/env',
		'client/compile/lang',
		'client/compile/image',
		'client/compile/style',
		'client/compile/html',
		'client/compile/script',
		'client/compile/template',
		'client/compile/content',
		'client/compile/router'
	]);

};