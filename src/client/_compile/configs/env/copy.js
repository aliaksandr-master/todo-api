"use strict";
module.exports = function(grunt){

	return {

		'client-env': {

			options: {
				excludeEmpty: true
			},

			files: [
				{
					src: this.SRC + '/client/.htaccess',
					dest: this.BUILD + '/client/.htaccess'
				}
			]
		}
	};
};