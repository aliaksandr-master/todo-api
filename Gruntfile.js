"use strict";

var _ = require('lodash');

var cwd = process.cwd();

var params = {
	cwd: cwd + '/grunt',
	tasksDir: '/tasks'
};


var pkg = require('./package.json');

var options = {

	CWD:    cwd,
	SRC:    cwd + '/src',
	DEPLOY: cwd + '/deploy',
	DEV:    cwd + '/.developer',
	GRUNT:  cwd + '/grunt',
	BUILD:  cwd + '/build',
	TMP:    cwd + '/tmp',

	buildTimestamp: Date.now(),
	package: pkg,
	liveReload: {
		port: 35729,
		src: '//' + pkg.name + ':35729/livereload.js'
	}
};


module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt);
	require('./node_require/grumble/grumble')(grunt, params, options);

	var config = {
			jshint: {
				options: grunt.file.readJSON('.jshintrc')
			}
		};

	var cwd;

	cwd = options.GRUNT + '/';



	cwd = paths.GRUNT + '/modules/';

	_.each(grunt.file.expand({ cwd: cwd }, '**/*.js'), function (fpath) {
		var condition = _.all(fpath.split(/[\\\/]+/), function (v) {
			return !/^_.+$/.test(v);
		});
		if (condition) {
			var prefix = fpath.replace(/\.js$/, '').replace(/([^\/]+)\/\1$/, '$1');

			var grumble = new Grumble(prefix);

			require(cwd + fpath).call(grumble, grunt, options);

			if (!grumble._main._name) {
				grumble.assign();
			}

			var _configs = {};
			var _aliases = {};
			_.each(grumble._main._sq, function (grumbleSq) {

				console.log(grumbleSq);

//				grunt.task.registerTask(aliasName, tasks);
			});

			config = _.merge(config, _configs);
		}
	});

	grunt.initConfig(config);
};