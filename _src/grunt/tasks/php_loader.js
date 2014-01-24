"use strict";
module.exports = function(grunt){

	var _ = require('underscore');

	var options = {
		cwd: 'server/',
		src: [
			'application/controllers/*.php',
			'application/controllers/**/*.php',
			'application/libraries/**/*.php',
			'application/libraries/*.php',
			'application/helpers/**/*.php',
			'application/helpers/*.php',
			'application/core/**/*.php',
			'application/core/*.php',
			'application/views/**/*.php',
			'application/views/*.php',
			'application/models/**/*.php',
			'application/models/*.php',
			'system/core/**/*.php',
			'system/core/*.php',
			'system/helpers/**/*.php',
			'system/helpers/*.php',
			'system/libraries/**/*.php',
			'system/libraries/*.php',
			'system/database/**/*.php',
			'system/database/*.php'
		],
		jsonSpaces: 4,
		apiRoot: '/server',
		dest: 'server/_generated_/class-map.json'
	};

	options.cwd = options.cwd.replace(/[\\\/]*$/, '/');

	return function(){
		var fs = grunt.file.expand({cwd: options.cwd}, options.src);
		var classMap = {};

		var add = function(className, filePath){
			classMap[className] = filePath;
		};

		_.each(fs, function(filePath){
			var fileName = filePath.split(/[\\\/]+/).pop();
			var content = grunt.file.read(options.cwd + filePath);
			if(/\s+(class|interface)\s*/.test(content)){
				content.replace(/\n\s*(?:abstract|final)?\s*(class|interface)\s+([a-z0-9A-Z_]+)\s*/g, function($0, $1, $2){
					add($2, filePath);
					return $0;
				});
			}
		});

		grunt.file.write(options.dest, JSON.stringify(classMap, null, 4));
		grunt.log.ok('file: "' + options.dest + '" was created');
//		console.log(classMap);

	};

};