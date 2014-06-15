'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this
		.watch('jade', {
			files: [
				opt.SRC + '/api-tester/**/*.jade'
			],
			tasks: [
				'api-tester/compile/page'
			]
		})

		.watch('less', {
			files: [
				opt.SRC + '/api-tester/**/*.{less,css}'
			],
			tasks: [
				'api-tester/compile/styles'
			]
		})

		.watch('js', {
			files: [
				opt.SRC + '/api-tester/**/*.js'
			],
			tasks: [
				'api-tester/compile/js'
			]
		})

		.watch('templates', {
			files: [
				opt.SRC + '/api-tester/**/*.hbs'
			],
			tasks: [
				'api-tester/compile/templates'
			]
		})

		.watch('other', {
			files: [
				opt.SRC + '/api-tester/**/*.php',
				opt.SRC + '/api-tester/.htaccess'
			],
			tasks: [
				'api-tester/compile/env'
			]
		})
	;

};