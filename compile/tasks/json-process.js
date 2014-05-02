"use strict";

module.exports = function (grunt) {

	grunt.task.registerMultiTask('json-process', function () {
		var fileFilterer = require('../utils/task/fileFilterer');
		var logFileOk = require('../utils/task/logFileOk');
		var _ = require('lodash');

		var options = this.options({
			process: function (content, fpath, dest, fileObj) {
				return content;
			}
		});

		fileFilterer(grunt, this, function (fpath, dest, fileObj) {
			var json = grunt.file.readJSON(fpath);
			var obj = options.process(json, fpath, fileObj);
			if (!_.isString(obj)) {
				obj = JSON.stringify(obj);
			}
			grunt.file.write(!dest || fileObj.orig.overwrite ? fpath : dest, obj);
			logFileOk(dest);
		});
	});

};