"use strict";
module.exports = function(grunt){

	return {

		'env-prod': {
			files: [
				{
					expand: true,
					cwd: this.BUILD,
					src: [
						'**/*',
						'*'
					],
					dest: this.DEPLOY
				},
				{
					expand: true,
					cwd: this.SRC + "/_compile/env/prod/",
					src: [
						'**/*',
						'*'
					],
					dest: this.DEPLOY
				}
			]
		}

	};

};