module.exports = function(grunt) {
	'use strict';
	var GRUNT_OPTIONS_FILE = './_src/grunt/options.js',
		GRUNT_ALIASES_DIR = './_src/grunt/aliases',
		GRUNT_TASKS_DIR = './_src/grunt/tasks',
		config = {},
		opt = require(GRUNT_OPTIONS_FILE).call(grunt);

	register(GRUNT_TASKS_DIR, function(k, v){
		config[k] = v;
	});

	register(GRUNT_ALIASES_DIR,grunt.registerTask);

	require('matchdep').filter('grunt-*').forEach(grunt.loadNpmTasks);
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
	require('time-grunt')(grunt);
	grunt.initConfig(config);

	function register(dir,callback){
		var df = grunt.file.expand({cwd: dir}, ['*.js','**/*.js']);
		opt._.each(df, function(fpath){
			var name = fpath.split('.'),
				result = require(dir+'/'+fpath);
			name.pop();
			callback.call(grunt, name.join('.'), opt._.isFunction(result) ? result.call(opt, grunt) : result);
		});
	}
};