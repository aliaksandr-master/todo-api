"use strict";
module.exports = function(grunt){

	return {

		'api-var': [
			this.BUILD + '/api/var/*.json',
			this.BUILD + '/api/var/**/.json'
		]

	};
};