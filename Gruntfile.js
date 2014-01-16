module.exports = function (grunt) {
	'use strict';
	var GRUNT_OPTIONS_FILE = './_src/grunt/options.js',
		GRUNT_ALIASES_DIR = './_src/grunt/aliases',
		GRUNT_TASKS_DIR = './_src/grunt/tasks',
		config = {},
		opt = require(GRUNT_OPTIONS_FILE).call(grunt);
	register(GRUNT_TASKS_DIR, function (k, v) {
		if(typeof v !== 'function'){
			config[k] = v;
		}
	});
	register(GRUNT_TASKS_DIR, function (k, v) {
		if(typeof v === 'function'){
			grunt.registerTask(k, v);
		}
	});
	register(GRUNT_ALIASES_DIR, grunt.registerTask);
	require('matchdep').filter('grunt-*').forEach(grunt.loadNpmTasks);
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
	grunt.initConfig(config);
	function register (dir, callback) {
		var df = grunt.file.expand({cwd: dir}, ['*.js', '**/*.js']);
		opt._.each(df, function (fpath) {
			var name = fpath.split('.'),
				options = require(dir+'/'+fpath);
			name.pop();
			name = name.join('.');
			var task = opt._.isFunction(options) ? options.call(opt, grunt) : options;
			callback.call(grunt, name, task);
		});
	}
};