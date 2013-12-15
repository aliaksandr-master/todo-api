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
		}

	};
};