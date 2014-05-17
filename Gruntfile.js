"use strict";

var _ = require('lodash');

module.exports = function (grunt) {

	var cwd = process.cwd();

	var pkg = require('./package.json');

	var fs = grunt.file.expand([
		'opt/nodejs/**/grunt-*.js',
		'!opt/nodejs/**/grunt-grumble.js'
	]);
	_.each(fs, function (f) {
		require(cwd + '/' + f)(grunt);
	});

	require('./opt/nodejs/custom/grunt-grumble/grunt-grumble')(grunt, {
		modulesDir: '/grunt/app',
		tasksDir: '/grunt/tasks',

		CWD:    cwd,
		SRC:    cwd + '/src',
		OPT:    cwd + '/opt',
		DEPLOY: cwd + '/deploy',
		DEV:    cwd + '/.developer',
		GRUNT:  cwd + '/grunt',
		BUILD:  cwd + '/build',
		VAR:    cwd + '/var',

		utils: {
			json2php: require('./opt/nodejs/custom/json-to-php-array/json-to-php-array')
		},

		buildTimestamp: Date.now(),
		package: pkg,
		liveReload: {
			port: 35729,
			src: '//' + pkg.name + ':35729/livereload.js'
		}
	});
};