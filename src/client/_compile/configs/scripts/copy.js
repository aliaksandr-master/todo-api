"use strict";
module.exports = function(grunt){

	return {

		'client-scripts': {
			files: [
				{
					expand: true,
					cwd: this.SRC + "/client/static/js/",
					src: [
						'**/*.js',
						'*.js'
					],
					dest: this.BUILD + "/client/static/js/"
				}
			]
		}

	};

};