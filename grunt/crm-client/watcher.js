'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);
	
	var src = opt.lnk(opt.SRC); 
	var name = opt.lnk();

	this
		.watch('script', {
			files: [
				src + '/static/**/*.js'
			],
			tasks: name + '/compile/script'
		})

		.watch('lang', {
			files: [
				src + '/lang/**/*.json'
			],
			tasks: name + '/compile/lang'
		})

		.watch('env', {
			files: [
				src + '/.htaccess',
				src + '/static/.htaccess'
			],
			tasks: name + '/compile/env'
		})

		.watch('image', {
			files: [
				src + '/static/**/*.{png,gif,jpeg,jpg,ico}'
			],
			tasks: name + '/compile/image'
		})

		.watch('html', {
			files: [
				src + '/static/**/*.html'
			],
			tasks: name + '/compile/html'
		})

		.watch('template', {
			files: [
				src + '/static/**/*.hbs'
			],
			tasks: name + '/compile/template'
		})

		.watch('style', {
			files: [
				src + '/static/**/*.{less,scss,sass,css}'
			],
			tasks: name + '/compile/style'
		})
	;

};