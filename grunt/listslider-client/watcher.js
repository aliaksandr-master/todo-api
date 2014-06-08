'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this.watch('script', {
		files: [
			SRC + '/static/**/*.js'
		],
		tasks: NAME + '/compile/script'
	});

	this.watch('lang', {
		files: [
			SRC + '/lang/**/*.json'
		],
		tasks: NAME + '/compile/lang'
	});

	this.watch('env', {
		files: [
			SRC + '/.htaccess',
			SRC + '/static/.htaccess'
		],
		tasks: NAME + '/compile/env'
	});

	this.watch('image', {
		files: [
			SRC + '/static/**/*.{png,gif,jpeg,jpg,ico}'
		],
		tasks: NAME + '/compile/image'
	});

	this.watch('html', {
		files: [
			SRC + '/static/**/*.html'
		],
		tasks: NAME + '/compile/html'
	});

	this.watch('template', {
		files: [
			SRC + '/static/**/*.hbs'
		],
		tasks: NAME + '/compile/template'
	});

	this.watch('style', {
		files: [
			SRC + '/static/**/*.{less,scss,sass,css}'
		],
		tasks: NAME + '/compile/style'
	});

};