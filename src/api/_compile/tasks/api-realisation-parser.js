'use strict';

module.exports = function(grunt){

	return function(){

		var configDb = grunt.file.readJSON(global.LOCAL+'/database.json');

		var config = {
			options: {
				beauty: true,
				verbose: false
			},
			dest: global.BUILD + '/api/var/'
		};

		var realisation;

		var rules = {};
		var filters = {};


	};


};