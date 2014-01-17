"use strict";
module.exports = function(grunt){

	return {
		compile: {
			expand: true,
			cwd: '_src/client',
			src: [
				'*.coffee',
				'**/*.coffee'
			],
			dest: 'client/',
			ext: '.js'
		}
	};

};