"use strict";

var _ = require('lodash');

module.exports = function (grunt) {

	var grind = require('./opt/nodejs/custom/grind-grunt/grind-grunt')(grunt, {
		modulesDir: 'grunt',
		taskMethods: true
	});

	var CWD = process.cwd();

	var pkg = require('./package.json');

	var fs = grunt.file.expand([
		'opt/nodejs/**/grunt-*.js',
		'!opt/nodejs/**/grunt-grumble.js'
	]);

	_.each(fs, function (f) {
		require(CWD + '/' + f)(grunt);
	});

	require('load-grunt-tasks')(grunt);

	grind.run({
		CWD:    CWD,
		SRC:    CWD + '/src',
		OPT:    CWD + '/opt',
		DEPLOY: CWD + '/deploy',
		DEV:    CWD + '/.developer',
		GRUNT:  CWD + '/grunt',
		BUILD:  CWD + '/build',
		VAR:    CWD + '/var',

		utils: {
			json2php: require('./opt/nodejs/custom/json-to-php-array/json-to-php-array')
		},

		buildTimestamp: Date.now(),
		package: pkg
	});
};