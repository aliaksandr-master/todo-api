"use strict";
module.exports = function(grunt){

	return {

		'client-vendor': {
			files: [
				{
					expand: true,
					cwd: this.SRC + "/client/static/vendor",
					src: [
						'**/*',
						'*'
					],
					dest: this.BUILD + "/client/static/vendor"
				}
			]
		},

	};

};