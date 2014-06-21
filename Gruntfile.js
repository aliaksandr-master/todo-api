"use strict";

var time = Date.now();

module.exports = require('grunto')(function(grunt) {
	var pkg = require('./package.json'),
		CWD = process.cwd();

	grunt.file.expand([ 'opt/nodejs/**/grunt-*.js' ]).forEach(function (f) {
		require(CWD + '/' + f)(grunt);
	});

	this.context({

		CWD:    CWD,
		SRC:    CWD + '/src',
		OPT:    CWD + '/opt',
		DEPLOY: CWD + '/deploy',
		DEV:    CWD + '/.developer',
		GRUNT:  CWD + '/grunt',
		BUILD:  CWD + '/build',
		VAR:    CWD + '/var',
		TMP:    CWD + '/tmp',

		lnk: function (before, after) {
			var link = this.CURRENT_PREFIX.replace(/^([^\/]+)\/.+$/, '$1').trim();
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

		build: {
			timestamp: time
		},

		package: pkg
	});

	this.scan([{
		cwd: 'grunt/',
		src: [
			'**/*.js',
			'!**/_*.js',
			'!**/_*/**/*.js'
		]
	}]);

	return {
		jshint: {
			options: grunt.file.readJSON('.jshintrc')
		},

		autoprefixer: {
			options: {
				browsers: ['last 2 version', 'ie 9'],
				diff: false,
				map: false
			}
		},

		watch: {
			options: {
				livereload: true,
				interrupt: true
			}
		}
	};

});