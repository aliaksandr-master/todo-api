'use strict';
module.exports = function(grunt) {
	var config = {};
	var opt = require('./_src/grunt/options.js').call(grunt);
	var register = function(dir,callback){
		var df = grunt.file.expand({cwd: dir}, ['*.js','**/*.js']);
		opt._.each(df, function(fpath){
			var name = fpath.split('.'),
				result = require(dir+'/'+fpath);
			name.pop();
			callback.call(grunt, name.join('.'), opt._.isFunction(result) ? result.call(opt, grunt) : result);
		});
	};
	register('./_src/grunt/tasks',function(k, v){
		config[k] = v;
	});
	register('./_src/grunt/aliases',grunt.registerTask);
	require('matchdep').filter('grunt-*').forEach(grunt.loadNpmTasks);
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
	require('time-grunt')(grunt);
	grunt.initConfig(config);
};