"use strict";
module.exports = function(grunt){

	return {
		install: {
			options: {
				install: true,
				verbose: false,
				layout: 'byType',
//				copy: true,
				targetDir: './client/vendor',
				cleanBowerDir: false,
				cleanTargetDir: true
			}
		}
	};
};