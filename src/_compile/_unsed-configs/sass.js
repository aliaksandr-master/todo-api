"use strict";
module.exports = function(grunt){

	return {
		compile: {
			options: {},
			files: [
				{
					expand: true,
					cwd: "src/client/styles",
					src: [
						'*.{sass,scss}'
					],
					dest: 'client/styles'
				}
			]
		}
	};

};