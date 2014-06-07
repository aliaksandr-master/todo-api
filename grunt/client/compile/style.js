"use strict";

module.exports = function (grunt) {
	var opt = this;

	this.clean([
		opt.BUILD + '/client/static/styles'
	]);

	this.clean('fonts', [
		opt.BUILD + '/client/static/fonts'
	]);

	this.copy({
		files: [{
			expand: true,
			cwd: opt.SRC + "/client/",
			src: [
				'**/*.css',
				'*.css'
			],
			dest: opt.BUILD + "/client/"
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
			paths: [ opt.SRC + '/client/static/client' ]
		},
		files: [{
			expand: true,
			cwd: opt.SRC + "/client/static/styles",
			src: [
				'*.less',
				'**/*.less'
			],
			dest: opt.BUILD + '/client/static/styles',
			ext: '.css'
		}]
	});

	this.copy('fonts', {
		files: [
			{
				expand: true,
				cwd: opt.SRC + "/client/static/",
				src: '**/*.{ttf,svg,eot,woff}',
				dest: opt.BUILD + "/client/static/fonts/",
				flatten: true
			},
			{
				expand: true,
				cwd: opt.OPT + "/frontend",
				src: '**/{font,fonts}/**/*.{ttf,svg,eot,woff}',
				dest: opt.BUILD + "/client/static/fonts/",
				flatten: true
			}
		]
	});

	this.replace('fonts', {
		overwrite: true,
		src: [
			opt.BUILD + '/client/static/**/*.css'
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
					url = '/client/static-'+opt.buildTimestamp+'/fonts/'+fileName;
				}else if(/^[\/\\]*static\//.test(url) && /\.(png|jpg|jpeg|gif)/.test(url)){
					url = url.replace(/([\/\\]?)static[\\\/]]/,'$1static-' + opt.buildTimestamp +'/');
				}
				//							console.log($0,'  url: ',url);
				return "url('"+url+"')";
			}
		}]
	});

	this.autoprefixer({
		options: {
			browsers: ['last 2 version', 'ie 9'],
			diff: false,
			map: false
		},
		'client-styles': {
			expand: true,
			overwrite: true,
			src: [
				opt.BUILD + '/client/static/styles/*.css',
				opt.BUILD + '/client/static/styles/**/*.css',
				opt.BUILD + '/client/static/styles/**/*.css',
				opt.BUILD + '/client/static/vendor/**/*.css',
				opt.BUILD + '/client/static/vendor/*.css'
			]
		}
	});
};