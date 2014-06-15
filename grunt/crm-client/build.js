'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this
		.include([
			this.lnk(null, 'compile/env'),
			this.lnk(null, 'compile/lang'),
			this.lnk(null, 'compile/image'),
			this.lnk(null, 'compile/style'),
			this.lnk(null, 'compile/html'),
			this.lnk(null, 'compile/script'),
			this.lnk(null, 'compile/template'),
			this.lnk(null, 'compile/router')
		])
	;

};