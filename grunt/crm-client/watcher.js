"use strict";

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);
	
	var src = opt.lnk(opt.SRC); 
	var name = opt.lnk();

	this.watch('script', {
		files: [
			src + '/static/**/*.js'
		],
		tasks: name + '/compile/script'
	});

	this.watch('lang', {
		files: [
			src + '/lang/**/*.json'
		],
		tasks: name + '/compile/lang'
	});

	this.watch('env', {
		files: [
			src + '/.htaccess',
			src + '/static/.htaccess'
		],
		tasks: name + '/compile/env'
	});

	this.watch('image', {
		files: [
			src + '/static/**/*.{png,gif,jpeg,jpg,ico}'
		],
		tasks: name + '/compile/image'
	});

	this.watch('html', {
		files: [
			src + '/static/**/*.html'
		],
		tasks: name + '/compile/html'
	});

	this.watch('template', {
		files: [
			src + '/static/**/*.hbs'
		],
		tasks: name + '/compile/template'
	});

	this.watch('style', {
		files: [
			src + '/static/**/*.{less,scss,sass,css}'
		],
		tasks: name + '/compile/style'
	});

};