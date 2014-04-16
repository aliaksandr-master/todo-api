"use strict";

var grunt = require('grunt');

module.exports = {

	gruntFilterFiles: function (grunt, thisTaskObj, callback) {
		var _ = require('lodash');

		thisTaskObj.files.forEach(function(file) {
			var files = file.src.filter(function(filepath) {
				if (!grunt.file.exists(filepath)) {
					grunt.log.warn('Source file "' + filepath + '" not found.');
					return false;
				} else {
					return true;
				}
			});

			_.each(files, function (fpath) {
				callback(fpath, file.dest, file);
			});
		});
	},
	logFileOk: function (file) {
		file = file.replace(global.ROOT, '').replace(/^[\/]+/, '');
		grunt.log.ok('created ' + file);
	}
};