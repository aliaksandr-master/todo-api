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
		}

	};
};