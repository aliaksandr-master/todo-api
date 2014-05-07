"use strict";

module.exports = function (grunt) {

	grunt.task.registerMultiTask('json-merge', function () {

		var _ = require('lodash');
		var fileFilterer = require('../utils/task/fileFilterer');
		var logFileOk = require('../utils/task/logFileOk');

		var options = this.options({
			outputJSON: null,
			deepMerge: true,
			beauty: true
		});

		var result = null;
		fileFilterer(grunt, this, function (fpath, dest, fileObj) {
			var json = {};
			if (/\.json$/.test(fpath)) {
				json = grunt.file.readJSON(fpath);
			}
			if (/\.js$/.test(fpath)) {
				json = require(fpath);
			}
			if (options.array) {
				if (result === null) {
					result = [];
				}
				result = result.concat(json);
			} else {
				if (result === null) {
					result = {};
				}
				result = options.deepMerge ? _.merge(result, json) : _.extend(result, json);
			}
		});

		if (options.outputJSON) {
			grunt.file.write(options.outputJSON, JSON.stringify(result, null, options.beauty ? 4 : null));
			logFileOk(options.outputJSON);
		} else {
			grunt.fail.fatal('dest or outputJSON is undefined');
		}

	});
};