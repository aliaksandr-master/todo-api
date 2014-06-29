"use strict";

module.exports = function (grunt) {

	grunt.task.registerMultiTask('processFile', function () {
		var fileProcessor = require('../grunt-additional-task-utils/gruntTaskFileProcessor')(this);

		var options = this.options({
			readFile: function (fpath, readOptions) {
				switch (require('path').extname(fpath)) {
					case '.json':
						return grunt.file.readJSON(fpath, readOptions);
						break;
					case '.yaml':
						return grunt.file.readYAML(fpath, readOptions);
						break;
				}
				return grunt.file.read(fpath, readOptions);
			},

			process: function (fpath, content) {
				return grunt.fail.fatal('process function is undefined');
			},

			beautifyJSON: true
		});

		fileProcessor.configure(options);

		fileProcessor.each(options.process);
	});

};