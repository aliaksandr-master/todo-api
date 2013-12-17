"use strict";
module.exports = function(grunt){

	return {
		install: {
			options: {
				install: true,
				verbose: true,
				layout: 'byType',
//				copy: true,
				targetDir: './client/vendor',
				cleanBowerDir: false,
				cleanTargetDir: true
			}
		}
	};
};