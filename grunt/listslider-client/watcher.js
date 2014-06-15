'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this
		.watch('script', {
			files: [
				SRC + '/static/**/*.js'
			],
			tasks: NAME + '/compile/script'
		})

		.watch('lang', {
			files: [
				SRC + '/lang/**/*.json'
			],
			tasks: NAME + '/compile/lang'
		})

		.watch('env', {
			files: [
				SRC + '/.htaccess',
				SRC + '/static/.htaccess'
			],
			tasks: NAME + '/compile/env'
		})

		.watch('image', {
			files: [
				SRC + '/static/**/*.{png,gif,jpeg,jpg,ico}'
			],
			tasks: NAME + '/compile/image'
		})

		.watch('html', {
			files: [
				SRC + '/static/**/*.html'
			],
			tasks: NAME + '/compile/html'
		})

		.watch('template', {
			files: [
				SRC + '/static/**/*.hbs'
			],
			tasks: NAME + '/compile/template'
		})

		.watch('style', {
			files: [
				SRC + '/static/**/*.{less,scss,sass,css}'
			],
			tasks: NAME + '/compile/style'
		})
	;

};