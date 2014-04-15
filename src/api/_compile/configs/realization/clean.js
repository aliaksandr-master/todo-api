"use strict";

module.exports = function(grunt){

	return {
		'api-realization': [
		   this.BUILD + '/api/controllers',
		   this.BUILD + '/api/models',
		   this.BUILD + '/api/index.php',
		   this.BUILD + '/api/.htaccess'
		]
	};
};