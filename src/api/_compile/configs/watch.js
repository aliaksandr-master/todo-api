"use strict";
module.exports = function(grunt, options){

	return {

		api: {
			files: [
				this.SRC + '/api/definition/**/*.{json,js}',
				this.SRC + '/api/definition/*.{json,js}'
			],
			tasks: 'build-api'
		}

	};
};