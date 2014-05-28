"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.run('watch:jade', {
		files: [
			opt.SRC + '/api-tester/**/*.jade'
		],
		tasks: [
			'api-tester/compile/page'
		]
	});

	this.run('watch:less', {
		files: [
			opt.SRC + '/api-tester/**/*.{less,css}'
		],
		tasks: [
			'api-tester/compile/styles'
		]
	});

	this.run('watch:js', {
		files: [
			opt.SRC + '/api-tester/**/*.js'
		],
		tasks: [
			'api-tester/compile/js'
		]
	});

	this.run('watch:templates', {
		files: [
			opt.SRC + '/api-tester/**/*.hbs'
		],
		tasks: [
			'api-tester/compile/templates'
		]
	});

	this.run('watch', {
		files: [
			opt.SRC + '/api-tester/**/*.php',
			opt.SRC + '/api-tester/.htaccess'
		],
		tasks: [
			'api-tester/compile/env'
		]
	});

};