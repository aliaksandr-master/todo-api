"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.watch('jade', {
		files: [
			opt.SRC + '/api-tester/**/*.jade'
		],
		tasks: [
			'api-tester/compile/page'
		]
	});

	this.watch('less', {
		files: [
			opt.SRC + '/api-tester/**/*.{less,css}'
		],
		tasks: [
			'api-tester/compile/styles'
		]
	});

	this.watch('js', {
		files: [
			opt.SRC + '/api-tester/**/*.js'
		],
		tasks: [
			'api-tester/compile/js'
		]
	});

	this.watch('templates', {
		files: [
			opt.SRC + '/api-tester/**/*.hbs'
		],
		tasks: [
			'api-tester/compile/templates'
		]
	});

	this.watch('other', {
		files: [
			opt.SRC + '/api-tester/**/*.php',
			opt.SRC + '/api-tester/.htaccess'
		],
		tasks: [
			'api-tester/compile/env'
		]
	});

};