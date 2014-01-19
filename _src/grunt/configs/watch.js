"use strict";
module.exports = function(grunt){

	var opt = this;

	return {

		options: {
			livereload: opt.liveReload.port
		},

		scripts: {
			files: [
				'_src/client/**/*.{coffee,ts,js}',
				'_src/client/*.{coffee,ts,js}'
			],
			tasks: 'compile_scripts'
		},

		pitures: {
			files: [
				'_src/client/**/*.{png,gif,jpeg,jpg,ico}',
				'_src/client/*.{png,gif,jpeg,jpg,ico}'
			],
			tasks: 'compile_pictures'
		},

		html: {
			files: [
				'_src/client/**/*.html',
				'_src/client/*.html'
			],
			tasks: 'compile_html'
		},

		grunt: {
			files: [
				'_src/grunt/**/*.js',
				'_src/grunt/*.js'
			],
			tasks: 'build'
		},

		templates: {
			files: [
				'_src/client/**/*.hbs',
				'_src/client/*.hbs'
			],
			tasks: 'compile_templates'
		},

		styles: {
			files: [
				'_src/client/**/*.{less,scss,sass,css}',
				'_src/client/*.{less,scss,sass,css}'
			],
			tasks: 'compile_styles'
		},

//		php: {
//			files: [
//				'server/**/*.{php,inc}'
//			],
//			tasks: 'compile_php'
//		},

		api: {
			files: [
				'_src/api/**/*.{json,js}',
				'_src/api/*.{json,js}'
			],
			tasks: 'compile_php'
		}

	};
};