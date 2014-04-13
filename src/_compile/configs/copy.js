"use strict";
module.exports = function(grunt){

	return {

		'build-env': {
			files: [
				{
					src: this.SRC + '/.htaccess',
					dest: this.BUILD + '/.htaccess'
				}
			]
		}

	};

};