"use strict";

module.exports = function (grunt) {

	grunt.task.registerMultiTask('js-to-json', function () {
		var fileFilterer = require('../utils/task/fileFilterer');
		var logFileOk = require('../utils/task/logFileOk');

		fileFilterer(grunt, this, function (fpath, dest, fileObj) {
			var json = require(fpath);
			grunt.file.write(dest, JSON.stringify(json));
			logFileOk(dest);
		});
	});

};