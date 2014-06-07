'use strict';

module.exports = function (grunt) {
	grunt.task.registerMultiTask('jsonMerge', function () {
		var _ = require('lodash');
		var path = require('path');
		var fileProcessor = require('../grunt-additional-task-utils/gruntTaskFileProcessor')(this);

		var options = this.options({

			processContent: function (content, fpath) {
				return content;
			},

			processResult: function (result, dest) {
				return result;
			},

			readFile: function (fpath) {
				var json = {};
				if (/\.json$/.test(fpath)) {
					json = grunt.file.readJSON(fpath);
				} else if (/\.js$/.test(fpath)) {
					json = require(fpath);
				} else {
					grunt.fail.fatal('can\'t read file with extension ' + path.extname(fpath));
				}
				return json;
			},

			array: false,

			deepMerge: true,

			beautify: false
		});

		fileProcessor.configure({
			blockMode: true,
			readFile: options.readFile,
			beautifyJSON: options.beautify,
			processContent: options.processContent,
			processResult: options.processResult
		});

		fileProcessor.each(function (fpath, json) {
			var result = this.result == null ? (options.array ? [] : {}) : this.result;
			if (options.array) {
				result = result.concat(json);
			} else {
				result = options.deepMerge ? _.merge(result, json) : _.extend(result, json);
			}
			return result;
		});
	});
};