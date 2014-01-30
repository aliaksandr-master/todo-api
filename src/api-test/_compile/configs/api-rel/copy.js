"use strict";

module.exports = function(grunt, options){

	//

	return {
		'api-test-var': {
			options: {
				excludeEmpty: true
			},
			files: [
				{
					expand: true,
					cwd: global.BUILD + '/api/var',
					src: [
						'*.json',
						'**/*.json',
					],
					dest: global.BUILD + '/api-test/var'
				}
			]
		}
	};

};