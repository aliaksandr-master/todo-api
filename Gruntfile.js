"use strict";

var _ = require('lodash');

module.exports = function (grunt) {

	var cwd = process.cwd();

	var pkg = require('./package.json');

	require('./node_require/grumble/grumble')(grunt, {
		modulesDir: '/grunt/app',
		tasksDir: '/grunt/tasks',

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
	});
};