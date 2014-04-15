"use strict";

module.exports = function (grunt) {

	return {

		'api-realization': {

			options: {
				cwd: this.BUILD + '/',
				src: [
					'api/index.php',
					'api/controllers/**/*.php',
					'api/models/**/*.php',
					'opt/helpers/**/*.php',
					'opt/api/**/*.php',
					'opt/codeigniter/core/**/*.php',
					'opt/codeigniter/helpers/**/*.php',
					'opt/codeigniter/libraries/**/*.php',
					'opt/codeigniter/database/**/*.php'
				],
				beauty: false,
				outputJSON: this.COMPILED + '/classes/api.json'
			}
		}
	};
};