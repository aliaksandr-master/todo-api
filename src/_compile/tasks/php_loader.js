"use strict";
module.exports = function(grunt){

	var _ = require('underscore');

	var options = {
		cwd: 'build/api/',
		src: [
			'controllers/*.php',
			'controllers/**/*.php',
			'libraries/**/*.php',
			'libraries/*.php',
			'helpers/**/*.php',
			'helpers/*.php',
			'core/**/*.php',
			'core/*.php',
			'views/**/*.php',
			'views/*.php',
			'models/**/*.php',
			'models/*.php',
			'opt/codeigniter/core/**/*.php',
			'opt/codeigniter/core/*.php',
			'opt/codeigniter/helpers/**/*.php',
			'opt/codeigniter/helpers/*.php',
			'opt/codeigniter/libraries/**/*.php',
			'opt/codeigniter/libraries/*.php',
			'opt/codeigniter/database/**/*.php',
			'opt/codeigniter/database/*.php'
		],
		jsonSpaces: 4,
		apiRoot: '/api',
		dest: 'build/api/var/class-map.json'
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