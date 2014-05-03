"use strict";
module.exports = function (grunt) {

	grunt.task.registerMultiTask('api-specs-compiler', function () {
		var _ = require('lodash');
		var sha1 = require('sha1');

		var fileFilterer = require('../utils/task/fileFilterer');
		var logFileOk = require('../utils/task/logFileOk');
		var jsonParser = require('./_api-specs-compiler/parsers/json');
		var ramlParser = require('./_api-specs-compiler/parsers/raml'); // not implemented

		var parsers = {
			js: jsonParser,
			json: jsonParser
			//raml: ramlParser
		};

		var options = this.options({
			statuses: {},
			types: {}
		});

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