"use strict";
module.exports = function(grunt){

	return {

		'client-deploy-to-build': {
			files: [
				{
					expand: true,
					cwd: "deploy/client/",
					src: [
						'**/*',
						'*'
					],
					dest: "build/client/"
				}
			]
		},

		'client-build-to-deploy': {
			files: [
				{
					expand: true,
					cwd: "build/client/",
					src: [
						'**/*',
						'*'
					],
					dest: "deploy/client/"
				}
			]
		}

	};

};