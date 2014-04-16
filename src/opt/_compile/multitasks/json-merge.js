"use strict";

module.exports = function (grunt) {

	return function () {

		var _ = require('lodash');
		var taskUtils = require('./_utils');

		var options = this.options({
			files: [],
			outputJSON: null,
			deepMerge: true,
			beauty: true
		});

		var result = {};
		var destDir = null;
		taskUtils.gruntFilterFiles(grunt, this, function (fpath, dest, fileObj) {
			if (destDir === null) {
				destDir = fileObj.orig.dest.replace(/\/$/, '');
			}
			var json = {};
			if (/\.json$/.test(fpath)) {
				json = grunt.file.readJSON(fpath);
			}
			if (/\.js$/.test(fpath)) {
				json = require(fpath);
			}
			result = options.deepMerge ? _.merge(result, json) : _.extend(result, json);
		});

		if (destDir && options.outputJSON) {
			options.outputJSON = destDir + '/' + options.outputJSON.replace(/^\//, '');
			grunt.file.write(options.outputJSON, JSON.stringify(result, null, options.beauty ? 4 : null));
			grunt.log.ok('file ' + options.outputJSON + ' was created!');
		} else {
			grunt.fail.fatal('dest or outputJSON is undefined');
		}

	}
};