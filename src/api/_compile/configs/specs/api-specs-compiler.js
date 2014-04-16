"use strict";

module.exports = function(grunt){

	return {

		'api-specs': {

			options: require(this.SRC + '/api/specs-options.js'),

			files: [
				{
					expand: true,
					cwd: global.SRC + '/api/specs',
					src: [
						'**/*.{json,raml,yaml,js}'
					],
					ext: '.json',
					dest: global.COMPILED + '/api-specs/'
				}
			]
		}
	};
};