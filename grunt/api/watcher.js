'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this
		.watch('specs', {
			files: [
				opt.SRC + '/api/**/*.spec.{json,js}'
			],
			tasks: [
				'api/specs',
				'api-tester/build'
			]
		})

		.watch('php', {
			files: [
				opt.SRC + '/api/**/*.php'
			],
			tasks: [
				'api/build',
				'pragma'
			]
		})
	;

};