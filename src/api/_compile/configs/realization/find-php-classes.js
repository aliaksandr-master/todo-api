"use strict";

module.exports = function (grunt) {

	return {

		'api-classes': {

			options: {
				cwd: this.BUILD + '/',
				src: [
					'api/index.php',
					'api/controllers/**/*.php',
					'api/models/**/*.php',
					'opt/helpers/**/*.php',
					'opt/api/**/*.php',
					'opt/router/**/*.php'
				],
				beauty: false,
				outputJSON: this.COMPILED + '/classes/api.json'
			}
		}
	};
};