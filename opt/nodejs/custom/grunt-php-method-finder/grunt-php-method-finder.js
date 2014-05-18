'use strict';

module.exports = function (grunt) {
	grunt.task.registerMultiTask('php-method-finder', function () {
		var _ = require('lodash');
		var path = require('path');
		var fileProcessor = require('../grunt-additional-task-utils/gruntTaskFileProcessor')(this);
		var logFileOk = require('../grunt-additional-task-utils/logFileOk');

		var options = this.options({

			processResult: function (result, dest) {
				return result;
			},

			filter: function (val, key) {
				return true;
			},

			beautify: false
		});

		fileProcessor.configure({
			readFile: function (fpath) {
				return grunt.file.read(fpath);
			},
			beautifyJSON: options.beautify,
			processResult: options.processResult
		});

		fileProcessor.each(function (fpath, content) {
			var result = [];
			content.replace(/^((?:static|private|public|final|abstract|protected)?\s*)+function\s+&?\s*([a-zA-Z0-9_]+)\s*\(/gm, function (word, access, methodName) {
				result.push({
					attr: access.trim().length ? access.trim().split(/\s+/) : [],
					name: methodName
				});
			});
			result = result.filter(options.filter);
			return result;
		});
	});
};