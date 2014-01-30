"use strict";

module.exports = function(grunt, options){

	//

	return {
		'build-api-test': {
			options: {
				excludeEmpty: true
			},
			files: [
				{
					expand: true,
					cwd: global.BUILD + '/api/var',
					src: [
						'*.{json}',
						'**/*.{json}',
					],
					dest: global.BUILD + '/api-test/var'
				}
			]
		}
	};

};