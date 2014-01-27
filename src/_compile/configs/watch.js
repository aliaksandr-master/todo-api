"use strict";
module.exports = function(grunt, options){

	return {

		options: {
			livereload: options.liveReload.port
		},

		scripts: {
			files: [
				'src/client/**/*.{coffee,ts,js}',
				'src/client/*.{coffee,ts,js}'
			],
			tasks: 'compile_scripts'
		},

		pitures: {
			files: [
				'src/client/**/*.{png,gif,jpeg,jpg,ico}',
				'src/client/*.{png,gif,jpeg,jpg,ico}'
			],
			tasks: 'compile_pictures'
		},

		html: {
			files: [
				'src/client/**/*.html',
				'src/client/*.html'
			],
			tasks: 'compile_html'
		},

		templates: {
			files: [
				'src/client/**/*.hbs',
				'src/client/*.hbs'
			],
			tasks: 'compile_templates'
		},

		styles: {
			files: [
				'src/client/**/*.{less,scss,sass,css}',
				'src/client/*.{less,scss,sass,css}'
			],
			tasks: 'compile_styles'
		},

//		php: {
//			files: [
//				'api/**/*.{php,inc}',
//				'api/*.{php,inc}',
//			],
//			tasks: 'compile_php'
//		},

		api: {
			files: [
				'src/api/**/*.{json,js}',
				'src/api/*.{json,js}'
			],
			tasks: 'compile_api'
		}

	};
};