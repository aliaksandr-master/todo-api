"use strict";
module.exports = function(grunt){

	return {

		'env-dev': {
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
					cwd: this.SRC + "/_env/dev/",
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