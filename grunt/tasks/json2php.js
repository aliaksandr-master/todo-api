"use strict";

module.exports = function (grunt) {

	grunt.task.registerMultiTask('json2php', function () {
		var json2php = require('../utils/json2php.js');
		var fileFilterer = require('../utils/task/fileFilterer');
		var logFileOk = require('../utils/task/logFileOk');

		fileFilterer(grunt, this, function (fpath, dest, fileObj) {
			var json = grunt.file.readJSON(fpath);
			var php = json2php(json);
			grunt.file.write(dest, '<?php \nreturn ' + php + ';\n?>');
			logFileOk(dest);
		});
	});
};