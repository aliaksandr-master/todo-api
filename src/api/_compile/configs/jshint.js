"use strict";
module.exports = function(grunt){

	return {
		api: {
			src: [
				'src/api/**/*.js',
				'src/api/*.js',
				'src/api/**/*.json',
				'src/api/*.json'
			]
		}
	};
};