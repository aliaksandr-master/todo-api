"use strict";
module.exports = function(grunt){

	return {
		'api-specs': {
			src: [
				global.SRC + '/api/specs/**/*.{js,json}'
			]
		},
		'api-compile': {
			src: [
				global.SRC + '/api/_compile/**/*.{js,json}'
			]
		}
	};
};