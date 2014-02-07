"use strict";
module.exports = function(grunt){

	return {

		'client-compress-all': {
			files: [
				{
					expand: true,
					overwrite: true,
					src: [
						'build/client/**/*.css'
					]
				}
			]
		}

	};
};