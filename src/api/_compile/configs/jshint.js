"use strict";
module.exports = function(grunt){

	return {
		api: {
			src: [
				global.SRC + '/api/**/*.{js,json}',
				global.SRC + '/api/*.{js,json}'
			]
		}
	};
};