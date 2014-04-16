"use strict";

module.exports = function (grunt) {

	return {
		'api-classes': {
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