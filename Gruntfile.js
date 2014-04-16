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

	var config = {},
		options = require('./src/_compile/options.js')(grunt);

	function register (srcName, callback) {
		var cwd = './src';

		_.each(grunt.file.expand({ cwd:  cwd + '/' }, [

			'**/_compile/'+srcName+'/**/*.{js,json}'

		]), function (fpath) {

			var condition = _.all(fpath.split(/[\\\/]+/), function (v) {
				return !/^_.+$/.test(v) || /^_(compile|env)$/.test(v);
			});

			if (condition) {
				var name = fpath.split(/[\\\/]+/).pop().replace(/\.js$/, '');
				var module = require(cwd + '/' + fpath);
				var task = _.isFunction(module) ? module.call(global, grunt, options) : module;
				callback(name, task);
			} else {
				console.log('ignore from compile:', fpath);
			}
		});
	}

	register('tasks', grunt.registerTask);

	register('aliases', grunt.registerTask);

	register('multitasks', grunt.registerMultiTask);

	register('configs', function (name, task) {
		var taskObject = {};
		taskObject[name] = task;
		config = _.merge(config, taskObject);
	});

	console.log(_.keys(config.clean));

	grunt.initConfig(config);
};