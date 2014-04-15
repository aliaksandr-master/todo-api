"use strict";

module.exports = function (grunt) {

	return {
		'api-realization': {
			options: {

			},
			files: [
				{
					src: this.COMPILED + '/classes/api.json',
					dest: this.BUILD + '/api/var/classes.php'
				}
			]
		}
	};

};