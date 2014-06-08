'use strict';

module.exports = function (grunt) {
	var opt = this,
		NAME = this.lnk(),
		SRC = this.lnk(opt.SRC),
		BUILD = this.lnk(opt.BUILD);

	this.clean([
		BUILD + '/static/styles'
	]);

	this.clean('fonts', [
		BUILD + '/static/fonts'
	]);

	this.copy({
		files: [{
			expand: true,
			cwd: SRC + '/',
			src: [
				'**/*.css',
				'*.css'
			],
			dest: BUILD + '/'
		}]
	});

	this.less({
		options: {
			syncImport: true,
			dumpLineNumbers: false,
			ieCompat: true,
			relativeUrls: false,
			strictUnits: true,
			strictImports: true,
			rootpath: '',
			paths: [ SRC + '/static/client' ]
		},
		files: [{
			expand: true,
			cwd: SRC + '/static/styles',
			src: [
				'*.less',
				'**/*.less'
			],
			dest: BUILD + '/static/styles',
			ext: '.css'
		}]
	});

	this.copy('fonts', {
		files: [
			{
				expand: true,
				cwd: SRC + '/static/',
				src: '**/*.{ttf,svg,eot,woff}',
				dest: BUILD + '/static/fonts/',
				flatten: true
			},
			{
				expand: true,
				cwd: opt.OPT + '/frontend',
				src: '**/{font,fonts}/**/*.{ttf,svg,eot,woff}',
				dest: BUILD + '/static/fonts/',
				flatten: true
			}
		]
	});

	this.replace('fonts', {
		overwrite: true,
		src: [
			BUILD + '/static/**/*.css'
		],
		replacements: [{
			from: /url\s*\([^\)]+\)/gi,
			to: function($0){
				$0 = $0.replace(/^url/,'');
				var url = $0.replace(/['"\s\(\)]+/g, '').trim();
				var fileName;
				// FONTS
				if(/\.(woff|ttf|eot|svg)/.test(url)){
					fileName = url.split(/[\/\\]+/).pop();
					url = '/client/static-' + opt.build.timestamp + '/fonts/'+fileName;
				}else if(/^[\/\\]*static\//.test(url) && /\.(png|jpg|jpeg|gif)/.test(url)){
					url = url.replace(/([\/\\]?)static[\\\/]]/,'$1static-' + opt.build.timestamp + '/');
				}
				//							console.log($0,'  url: ',url);
				return 'url(\'' + url + '\')';
			}
		}]
	});

	this.autoprefixer({
		expand: true,
		overwrite: true,
		src: [
			BUILD + '/static/styles/*.css',
			BUILD + '/static/styles/**/*.css',
			BUILD + '/static/styles/**/*.css',
			BUILD + '/static/vendor/**/*.css',
			BUILD + '/static/vendor/*.css'
		]
	});
};