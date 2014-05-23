"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.run('watch:jade', {
		files: [
			opt.SRC + '/api-tester/**/*.jade',
			opt.SRC + '/api-tester/**/*.less'
		],
		tasks: [
			'api-tester/install',
			'api-tester/compile/static'
		]
	});

	this.run('watch', {
		files: [
			opt.SRC + '/api-tester/**/*.{php,js,hbs,htaccess}'
		],
		tasks: [
			'api-tester/install',
			'api-tester/build'
		]
	});

};