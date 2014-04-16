"use strict";
module.exports = function(grunt){

	return {

		'env-test': {
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
					cwd: this.SRC + "/_compile/env/test/",
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