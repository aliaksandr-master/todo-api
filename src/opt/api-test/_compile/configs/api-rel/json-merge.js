"use strict";

module.exports = function(grunt, options){

	//

	return {
		'api-test-specs': {
			options: {
				outputJSON: 'api.source.json'
			},
			files: [
				{
					expand: true,
					cwd: global.COMPILED + '/api-specs-source',
					src: '**/*.json',
					dest: global.BUILD + '/api-test/var'
				}
			]
		}
	};

};