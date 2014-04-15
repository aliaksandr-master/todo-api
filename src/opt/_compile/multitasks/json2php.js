"use strict";

module.exports = function (grunt) {

	return function () {
		var json2php = require(global.SRC + "/_compile/utils.js").json2phpArray;
		var _ = require('lodash');

		this.files.forEach(function(file) {
			var files = file.src.filter(function(filepath) {
				if (!grunt.file.exists(filepath)) {
					grunt.log.warn('Source file "' + filepath + '" not found.');
					return false;
				} else {
					return true;
				}
			});

			_.each(files, function (filepath) {
				var json = grunt.file.readJSON(filepath);
				var php = json2php(json);
				grunt.file.write(file.dest, '<?php \nreturn ' + php + ';\n?>');
				grunt.log.ok('file ' + file.dest + ' created!');
			});

		});
	}
};