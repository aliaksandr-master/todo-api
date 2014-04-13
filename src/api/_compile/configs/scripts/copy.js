"use strict";

module.exports = function(grunt){

	return {

		'api-scripts': {

			options: {
				excludeEmpty: true
			},

			files: [
				{
					expand: true,
					cwd: global.SRC + '/api/scripts/',
					src: [
						 '**/*.{php,inc}',
						 '**/.htaccess'
					],
					dest: global.BUILD + '/api'
				}
			]
		}
	};
};