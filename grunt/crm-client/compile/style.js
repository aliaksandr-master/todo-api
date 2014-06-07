"use strict";

module.exports = function (grunt) {
	var opt = this;

	var src = opt.lnk(opt.SRC);
	var build = opt.lnk(opt.BUILD);

	this.clean([
		build + '/static/styles'
	]);

	this.clean('fonts', [
		build + '/static/fonts'
	]);

	this.copy({
		files: [{
			expand: true,
			cwd: src + "/",
			src: [
				'**/*.css',
				'*.css'
			],
			dest: build + "/"
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
			paths: [ opt.lnk(opt.SRC, 'static/client') ]
		},
		files: [{
			expand: true,
			cwd: src + "/static/styles",
			src: [
				'*.less',
				'**/*.less'
			],
			dest: build + '/static/styles',
			ext: '.css'
		}]
	});

	this.copy('fonts', {
		files: [
			{
				expand: true,
				cwd: src + "/static/",
				src: '**/*.{ttf,svg,eot,woff}',
				dest: build + "/static/fonts/",
				flatten: true
			},
			{
				expand: true,
				cwd: opt.OPT + "/frontend",
				src: [
					'**/font/**/*.{ttf,svg,eot,woff}',
					'**/fonts/**/*.{ttf,svg,eot,woff}'
				],
				dest: build + "/static/fonts/",
				flatten: true
			}
		]
	});

	this.copy('opt-fonts', {

	});

	this.replace('fonts', {
		overwrite: true,
		src: [
			build + '/static/**/*.css'
		],
		replacements: [{
			from: /url\s*\([^\)]+\)/gi,
			to: function($0){
				$0 = $0.replace(/^url/,"");
				var url = $0.replace(/['"\s\(\)]+/g, "").trim();
				var fileName;
				// FONTS
				if(/\.(woff|ttf|eot|svg)/.test(url)){
					fileName = url.split(/[\/\\]+/).pop();
					url = opt.lnk('/', 'static-' + opt.buildTimestamp + '/fonts/' + fileName);
				}else if(/^[\/\\]*static\//.test(url) && /\.(png|jpg|jpeg|gif)/.test(url)){
					url = url.replace(/([\/\\]?)static[\\\/]]/,'$1static-' + opt.buildTimestamp +'/');
				}
				//							console.log($0,'  url: ',url);
				return "url('"+url+"')";
			}
		}]
	});

	this.autoprefixer({
		expand: true,
		overwrite: true,
		src: [
			build + '/static/styles/*.css',
			build + '/static/styles/**/*.css',
			build + '/static/styles/**/*.css',
			build + '/static/vendor/**/*.css',
			build + '/static/vendor/*.css'
		]
	});
};