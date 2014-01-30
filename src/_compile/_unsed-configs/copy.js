"use strict";
module.exports = function(grunt){

	return {

		options: {
//			excludeEmpty: true
		},

		build_to_client: {
			files: [
				{
					expand: true,
					cwd: "_temp/client/",
					src: [
						'**/*',
						'*'
					],
					dest: "build/client/"
				}
			]
		}

	};

};