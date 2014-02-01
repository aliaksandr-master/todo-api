"use strict";
module.exports = function(grunt, options){

	return {

		'api-test': {
			files: [
				this.SRC + '/api-test/assets/**/*.{json,js}',
				this.SRC + '/api-test/assets/*.{json,js}',
				this.SRC + '/api-test/templates/*.hbs',
				this.SRC + '/api-test/*.php',
				this.SRC + '/api-test/.htaccess'
			],
			tasks: 'build-api-test'
		}

	};
};