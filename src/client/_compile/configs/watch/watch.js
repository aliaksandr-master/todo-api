"use strict";
module.exports = function(grunt, options){

	return {

		options: {
			livereload: options.liveReload.port
		},

		'client-scripts': {
			files: [
				this.SRC+'/client/static/**/*.js',
				this.SRC+'/client/static/*.js'
			],
			tasks: 'compile-client-scripts'
		},

		'client-env': {
			files: [
				this.SRC+'/client/.htaccess',
				this.SRC+'/client/static/.htaccess'
			],
			tasks: 'compile-client-env'
		},

		'client-images': {
			files: [
				this.SRC + '/client/static/**/*.{png,gif,jpeg,jpg,ico}',
				this.SRC + '/client/static/*.{png,gif,jpeg,jpg,ico}'
			],
			tasks: 'compile-client-images'
		},

		'client-html': {
			files: [
				this.SRC + '/client/static/**/*.html',
				this.SRC + '/client/static/*.html'
			],
			tasks: 'compile-client-html'
		},

		'client-templates': {
			files: [
				this.SRC + '/client/static/**/*.hbs',
				this.SRC + '/client/static/*.hbs'
			],
			tasks: 'compile-client-templates'
		},

		'client-styles': {
			files: [
				this.SRC + '/client/static/**/*.{less,scss,sass,css}',
				this.SRC + '/client/static/*.{less,scss,sass,css}'
			],
			tasks: 'compile-client-styles'
		}

	};
};