"use strict";

var time = Date.now();

module.exports = function (grunt) {

	var pkg = require('./package.json');
	var grind = require('./opt/nodejs/custom/grind-grunt/grind-grunt')(grunt, {
		modulesDir: 'grunt',
		taskMethods: true
	});

	var CWD = process.cwd();

	grunt.file.expand([ 'opt/nodejs/**/grunt-*.js' ]).forEach(function (f) {
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

		lnk: function (before, after) {
			var link = this.$$prefix.replace(/^([^\/]+)\/.+$/, '$1').trim();
			if (before) {
				link = before.replace(/\/?$/, '/') + link;
			}
			if (after) {
				link = link + after.replace(/^\/?/, '/');
			}
			return link;
		},

		utils: {
			json2php: require('./opt/nodejs/custom/json-to-php-array/json-to-php-array')
		},

		buildTimestamp: Date.now(),
		package: pkg
	});

	console.log('>> grunt time:', (Date.now() - time) / 1000, 's');
};