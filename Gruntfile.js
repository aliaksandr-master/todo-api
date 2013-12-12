module.exports = function(grunt) {
	'use strict';
	var _ = require('underscore');

	require('time-grunt')(grunt);

	var options = require('./_src/grunt/options.js')(grunt);
	options._  = _;

	var iterator = function(folderName,callback){
		console.log('init :', folderName);
		var files = grunt.file.expand({cwd: './_src/grunt/'+folderName}, ['*.js','**/*.js']);
		_.each(files, function(filePath){
			var name = filePath.split('.');
			name.pop();
			name = name.join('.');
			var v = require('./_src/grunt/'+folderName+'/'+name+'.js');
			if(_.isFunction(v)){
				v = v.call(options, grunt);
			}
			callback.call(grunt, name, v);
		});
	};

	iterator('aliases',grunt.registerTask);

	var config = {};
	iterator('tasks',function(name, value){
		config[name] = value;
	});

	grunt.initConfig(config);

	require('matchdep').filter('grunt-*').forEach(grunt.loadNpmTasks);
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
};