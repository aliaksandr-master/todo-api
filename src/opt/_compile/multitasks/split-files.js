"use strict";

module.exports = function (grunt, options) {

	return function () {

		var _ = require('lodash');
		var taskUtils = require('./_utils');

		var options = this.options({
			process: function (content, filename, dest, fileObj) {
				return {};
			},
			preProcessContent: function (content, filename, dest, fileObj) {
				if (/\.json$/.test(filename)) {
					return JSON.parse(content);
				}
				if (/\.js$/.test(filename)) {
					return require(filename);
				}
				return content;
			}
		});

		taskUtils.gruntFilterFiles(grunt, this, function (fpath, dest, fileObj) {
			var content = grunt.file.read(fpath);
			content = options.preProcessContent(content, fpath, dest, fileObj);
			var files = options.process(content, fpath, dest, fileObj);
			_.each(files, function (content, filePath) {
				grunt.file.write(filePath, content);
				taskUtils.logFileOk(filePath);
			});
		});

	}
};