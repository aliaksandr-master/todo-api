"use strict";
module.exports = function(grunt){

	return {

		compile: {
			options: {
				stripBanners: true
			},
			expand: true,
			dest: 'client/',
			cwd: "client/",
			src: [
				'**/*.js',
				'*.js'
			]
		},

		env_production: {
			files: [
				{
					expand: true,
					overwrite: true,
					src: [
						'build_production/client/*.js',
						'build_production/client/**/*.js',
						'!build_production/client/**/*.min.js',
						'!build_production/client/vendor/spin/*',
					]
				}
			]
		}

	};
};