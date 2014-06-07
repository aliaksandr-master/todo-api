"use strict";

module.exports = function (grunt) {

	grunt.task.registerMultiTask('jsToJSON', function () {
		var fileFilterer = require('../grunt-additional-task-utils/fileFilterer');
		var logFileOk = require('../grunt-additional-task-utils/logFileOk');

		fileFilterer(grunt, this, function (fpath, dest, fileObj) {
			var json = require(fpath);
			grunt.file.write(dest, JSON.stringify(json));
			logFileOk(dest);
		});
	});

};