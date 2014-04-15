"use strict";

module.exports = function(grunt){

	return {

		'api-install': {

			options: {
				excludeEmpty: true
			},

			files: [
				{
					expand: true,
					cwd: global.SRC + '/opt/codeigniter-application',
					src: '**/*',
					dest: global.BUILD + '/api/'
				}
			]
		},

		'api-database-schema': {
			options: {
				excludeEmpty: true
			},

			files: [
				{
					src: global.COMPILED + '/database/default.scheme.json',
					dest: global.BUILD + '/api/var/database/default.scheme.json'
				}
			]
		}
	};
};