"use strict";

module.exports = function(grunt){

	return {

		'api-realization': {

			options: {
				excludeEmpty: true
			},

			files: [
				{
					expand: true,
					cwd: global.SRC + '/api/',
					src: [
						'controllers/**/*.php',
						'models/**/*.php',
						'.htaccess',
						'index.php'
					],
					dest: global.BUILD + '/api/'
				}
			]
		}
	};
};