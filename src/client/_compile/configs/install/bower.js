"use strict";
module.exports = function(grunt){

	return {
		'client-install': {
			options: {
				install: true,
				verbose: true,
				layout: 'byType',
//				copy: true,
				targetDir: this.BUILD + '/client/static/vendor',
				cleanBowerDir: false,
				cleanTargetDir: true
			}
		}
	};
};