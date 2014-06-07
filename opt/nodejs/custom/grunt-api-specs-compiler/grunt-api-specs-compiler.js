"use strict";
module.exports = function (grunt) {

	grunt.task.registerMultiTask('apiSpecsCompiler', function () {
		var _ = require('lodash');
		var sha1 = require('sha1');

		var fileFilterer = require('../grunt-additional-task-utils/fileFilterer.js');
		var logFileOk = require('../grunt-additional-task-utils/logFileOk');
		var jsonParser = require('./lib/parsers/json');
		var ramlParser = require('./lib/parsers/raml'); // not implemented

		var parsers = {
			js: jsonParser,
			json: jsonParser
			//raml: ramlParser
		};

		var options = this.options({
			beautify: false,
			verbose: false,
			runtimeOptions: function () {
				return {};
			}
		});

		options = _.extend({
			statuses: {},
			types: {},
			filters: [],
			rules: []
		}, options, _.result(options, 'runtimeOptions'));

		options.rules.push('optional', 'required');

		fileFilterer(grunt, this, function (fpath, dest, fileObj) {
			var allowCondition = _.all(fpath.split(/[\\\/]+/), function (v) {
				return !/^_/.test(v);
			});
			if (allowCondition) {
				var parsedObj;
				var ext = fpath.split('.').pop();
				try {
					parsedObj = parsers[ext].call(grunt, fpath, dest, options);
				} catch (e) {
					grunt.fail.fatal(e.message);
					return;
				}
				grunt.file.write(dest, JSON.stringify(parsedObj, null, options.beauty ? 4 : null));
				logFileOk(dest);
			}
		});
	});

};