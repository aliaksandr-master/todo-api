'use strict';

module.exports = function (grunt) {
	var opt = this;


	this.jshint('compile', {
		src: [
			opt.CWD + '/Gruntfile.js',
			opt.GRUNT + '/**/*.{js,json}'
		]
	});

	this.jshint('src', {
		src: [
			opt.SRC + '/**/*.{js,json}',
			'!' + opt.SRC + '/client/static/vendor/**/*.{js,json}',
			'!' + opt.SRC + '/api-tester/vendor/**/*.{js,json}'
		]
	});

	this.copyNewFiles('configs', {
		files: [{
			expand: true,
			cwd: opt.SRC,
			src: '**/configs/**/*.json',
			dest: opt.DEV
		}]
	});

	this.clean('temp', [
		opt.VAR
	]);

	this.include([
		'opt/install',
		'database/install',
		'api/install',
		'api-tester/install',
		'client/install',
		'crm-client/install'
	]);
};