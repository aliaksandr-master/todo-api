"use strict";

module.exports = function (grunt) {

	return {
		'api-router': {
			options: {

			},
			files: [
				{
					src: this.COMPILED + '/api-router/routes.json',
					dest: this.BUILD + '/api/var/routes.php'
				}
			]
		}
	};

};