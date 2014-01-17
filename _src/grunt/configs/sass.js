"use strict";
module.exports = function(grunt){

	return {
		compile: {
			options: {},
			files: [
				{
					expand: true,
					cwd: "_src/client/styles",
					src: [
						'*.{sass,scss}'
					],
					dest: 'client/styles'
				}
			]
		}
	};

};