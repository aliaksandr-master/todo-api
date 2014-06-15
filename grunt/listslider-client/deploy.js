'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this
		.less({
			options: {
				compress: true,
				ieCompat: true
			},
			files: [
				{
					expand: true,
					overwrite: true,
					src: [
						BUILD + '/**/*.css'
					]
				}
			]
		})

		.clean('deploy', [
			opt.DEPLOY + '/' + NAME
		])

		.copy('2deploy', {
			files: [{
				expand: true,
				cwd: BUILD,
				src: [ '**/*' ],
				dest: opt.DEPLOY + '/' + NAME
			}]
		})
	;


	var _ = require('lodash');

	var incOptions = {
		cwd: BUILD + '/static/js',
		rename: function(base, opt) {
			return opt.replace(/\.js$/, '');
		}
	};

	var include = _(grunt.file.expandMapping(['controllers/**/*.js'], '', incOptions)).pluck('dest');

	this
		.requirejs({
			options: {
				appDir: BUILD + '/static',
				baseUrl: 'js',
				dir: opt.DEPLOY + '/' + NAME + '/static',
				modules: [{
					name: 'main',
					include: include,
					insertRequire: ['main']
				}],
				mainConfigFile: opt.DEPLOY + '/' + NAME + '/static/js/config.js',
				almond: true,
				optimize: 'uglify2',
				useStrict: true,
				normalizeDirDefines: 'skip',
				keepBuildDir: false,
				preserveLicenseComments: false,
				inlineText: false
			}
		})

		.clean('build', [
			BUILD
		])

		.copy('2build', {
			files: [{
				expand: true,
				cwd: opt.DEPLOY + '/' + NAME,
				src: [ '**/*' ],
				dest: BUILD
			}]
		})
	;

};