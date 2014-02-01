"use strict";
module.exports = function(grunt, options){

	return {

		'api-definition': {
			files: [
				this.SRC + '/api/definition/**/*.{json,js}',
				this.SRC + '/api/definition/*.{json,js}'
			],
			tasks: 'build-api'
		},

		'api-classes': {
			files: [
				this.BUILD + '/api/**/*.php'
			],
			tasks: 'api-php-classes-register'
		}

	};
};