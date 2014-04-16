'use strict';

var _ = require('lodash');

global.ROOT   = __dirname;
global.SRC    = global.ROOT + '/src';
global.BUILD  = global.ROOT + '/build';
global.DEPLOY = global.ROOT + '/deploy';
global.LOCAL  = global.ROOT + '/_local';
global.COMPILED = global.BUILD + '/compiled.temp';

module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt);

	var pkg = grunt.file.readJSON('package.json');
	var config = {},
		options = {
			cacheKey: Date.now(),
			package: pkg,
			liveReload: {
				port: 35729,
				src: '//www.' + pkg.name + ':35729/livereload.js'
			}
		};

	function register (src, callback) {
		var cwd = './src';

		_.each(grunt.file.expand({ cwd:  cwd + '/' }, src), function (fpath) {

			var condition = _.all(fpath.split(/[\\\/]+/), function (v) {
				return !/^_.+$/.test(v) || /^_compile$/.test(v);
			});
			if (condition) {
				var name = fpath.split(/[\\\/]+/).pop().replace(/\.js$/, '');
				var module = require(cwd + '/' + fpath);
				var task = _.isFunction(module) ? module.call(global, grunt, options) : module;
				callback(name, task);
			} /*else {
				console.log('ignore from compile:', fpath);
			}*/
		});
	}

	register('**/_compile/tasks/**/*.js', grunt.registerTask);

	register('**/_compile/aliases.js', function (_1, tasks) {
		_.each(tasks, function (task, key) {
			grunt.log.ok('alias: ' + key);
			grunt.registerTask(key, task);
		});
	});

	register('**/_compile/multitasks/**/*.js', grunt.registerMultiTask);

	register('**/_compile/configs/**/*.js', function (name, task) {
		var taskObject = {};
		taskObject[name] = task;
		config = _.merge(config, taskObject);
	});

	grunt.initConfig(config);
};