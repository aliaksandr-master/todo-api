"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.watch('script', {
		files: [
			opt.SRC + '/client/static/**/*.js'
		],
		tasks: 'client/compile/script'
	});

	this.watch('lang', {
		files: [
			opt.SRC+'/client/lang/**/*.json'
		],
		tasks: 'client/compile/lang'
	});

	this.watch('env', {
		files: [
			opt.SRC+'/client/.htaccess',
			opt.SRC+'/client/static/.htaccess'
		],
		tasks: 'client/compile/env'
	});

	this.watch('image', {
		files: [
			opt.SRC + '/client/static/**/*.{png,gif,jpeg,jpg,ico}'
		],
		tasks: 'client/compile/image'
	});

	this.watch('html', {
		files: [
			opt.SRC + '/client/static/**/*.html'
		],
		tasks: 'client/compile/html'
	});

	this.watch('template', {
		files: [
			opt.SRC + '/client/static/**/*.hbs'
		],
		tasks: 'client/compile/template'
	});

	this.watch('style', {
		files: [
			opt.SRC + '/client/static/**/*.{less,scss,sass,css}'
		],
		tasks: 'client/compile/style'
	});

};