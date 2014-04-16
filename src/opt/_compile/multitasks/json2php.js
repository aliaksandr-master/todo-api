"use strict";

module.exports = function (grunt) {

	return function () {
		var json2php = require(global.SRC + "/_compile/utils.js").json2phpArray;
		var taskUtils = require('./_utils');

		taskUtils.gruntFilterFiles(grunt, this, function (fpath, dest, fileObj) {
			var json = grunt.file.readJSON(fpath);
			var php = json2php(json);
			grunt.file.write(dest, '<?php \nreturn ' + php + ';\n?>');
			grunt.log.ok('file ' + dest + ' created!');
		});
	}
};