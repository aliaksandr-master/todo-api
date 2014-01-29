"use strict";
module.exports = function(grunt){

	return {
		client: {
			src: [
				'src/client/js/**/*.js',
				'src/client/js/*.js',
				'src/client/*.js'
			]
		}

	};
};