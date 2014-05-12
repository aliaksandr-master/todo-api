"use strict";

module.exports = function (grunt) {

	grunt.task.registerMultiTask('json2php', function () {
		var json2php = require('../json-to-php-array/json-to-php-array.js');
		var fileFilterer = require('../grunt-additional-task-utils/fileFilterer');
		var logFileOk = require('../grunt-additional-task-utils/logFileOk');

		fileFilterer(grunt, this, function (fpath, dest, fileObj) {
			var json = grunt.file.readJSON(fpath);
			var php = json2php(json);
			grunt.file.write(dest, '<?php \nreturn ' + php + ';\n?>');
			logFileOk(dest);
		});
	});
};