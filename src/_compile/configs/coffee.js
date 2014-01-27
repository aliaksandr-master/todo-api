"use strict";
module.exports = function(grunt){

	return {
		compile: {
			expand: true,
			cwd: 'src/client',
			src: [
				'*.coffee',
				'**/*.coffee'
			],
			dest: 'client/',
			ext: '.js'
		}
	};

};