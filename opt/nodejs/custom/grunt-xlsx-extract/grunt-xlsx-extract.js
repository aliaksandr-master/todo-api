"use strict";


module.exports = function (grunt) {

	grunt.registerMultiTask('xlsxExtract', function () {
		var xlsx = require('node-xlsx');
		var fileProcessor = require('../grunt-additional-task-utils/gruntTaskFileProcessor')(this);

		var options = this.options({
			readFile: function (fpath) {
				return xlsx.parse(fpath);
			},
			beautifyJSON: true
		});

		fileProcessor.configure(options);

		fileProcessor.each();

	});

};