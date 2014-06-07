"use strict";

module.exports = function (grunt) {

	grunt.task.registerMultiTask('jsonProcess', function () {
		var fileFilterer = require('../grunt-additional-task-utils/fileFilterer');
		var logFileOk = require('../grunt-additional-task-utils/logFileOk');
		var _ = require('lodash');

		var options = this.options({
			beautify: false,
			process: function (content, fpath, dest, fileObj) {
				return content;
			}
		});

		fileFilterer(grunt, this, function (fpath, dest, fileObj) {
			var json = grunt.file.readJSON(fpath);
			var obj = options.process(json, fpath, fileObj);
			if (!_.isString(obj)) {
				obj = JSON.stringify(obj, null, options.beautify ? 4 : null);
			}
			grunt.file.write(!dest || fileObj.orig.overwrite ? fpath : dest, obj);
			logFileOk(dest);
		});
	});

};