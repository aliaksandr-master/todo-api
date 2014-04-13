"use strict";
module.exports = function(grunt, options){

	return {

		options: {
			livereload: options.liveReload.port
		},

		env: {
			files: [
				this.SRC + '/.htaccess'
			],
			tasks: 'copy:build-env'
		}

	};
};