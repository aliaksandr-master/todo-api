'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this
		.watch({
			files: [
				opt.SRC + "/opt/**/*.php"
			],
			tasks: [
				'copy:opt/install',
				'pragma'
			]
		})
	;

};