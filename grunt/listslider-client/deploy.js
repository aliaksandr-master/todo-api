'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this.less({
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
	});

	this.clean('deploy', [
		opt.DEPLOY + '/' + NAME
	]);

	this.copy('2deploy', {
		files: [{
			expand: true,
			cwd: BUILD,
			src: [ '**/*' ],
			dest: opt.DEPLOY + '/' + NAME
		}]
	});


	var _ = require('lodash');

	var incOptions = {
		cwd: BUILD + '/static/js',
		rename: function(base, opt) {
			return opt.replace(/\.js$/, '');
		}
	};

	var include = _(grunt.file.expandMapping(['controllers/**/*.js'], '', incOptions)).pluck('dest');

	this.requirejs({
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
			//				generateSourceMaps: true,
			//				cssIn: 'styles/index.css',
			//				out: opt.DEPLOY + '/' + NAME + '/static/styles/main.css',
			//				optimizeCss: 'standard.keepLines',
			//				cssImportIgnore: null,
			//				uglify2: {
			//					//Example of a specialized config. If you are fine
			//					//with the default options, no need to specify
			//					//any of these properties.
			//					output: {
			//						beautify: false
			//					},
			//					compress: {
			//						sequences: false,
			//						global_defs: {
			//							DEBUG: false
			//						}
			//					},
			//					warnings: true,
			//					mangle: false
			//				},
			//				uglify: {
			//					toplevel: true,
			//					ascii_only: true,
			//					beautify: true,
			//					max_line_length: 1000,
			//
			//					//How to pass uglifyjs defined symbols for AST symbol replacement,
			//					//see 'defines' options for ast_mangle in the uglifys docs.
			//					defines: {
			//						DEBUG: ['name', 'false']
			//					},
			//
			//					//Custom value supported by r.js but done differently
			//					//in uglifyjs directly:
			//					//Skip the processor.ast_mangle() part of the uglify call (r.js 2.0.5+)
			//					no_mangle: true
			//				}

		}
	});

	this.clean('build', [
		BUILD
	]);

	this.copy('2build', {
		files: [{
			expand: true,
			cwd: opt.DEPLOY + '/' + NAME,
			src: [ '**/*' ],
			dest: BUILD
		}]
	});

};