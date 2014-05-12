"use strict";

module.exports = function (grunt) {


	grunt.task.registerMultiTask('copyByConfig', function () {
		var _ = require('lodash');
		var path = require('path');

		var processor = require('../grunt-additional-task-utils/gruntTaskFileProcessor')(this);

		var options = this.options({});

		processor.configure({
			readFile: function (fpath) {
				if (!/.json$/.test(fpath)) {
					grunt.fail.fatal('invalid extension of file "' + fpath +'", must be json file');
					return null;
				}
				return grunt.file.readJSON(fpath);
			}
		});

		processor.each(function (fpath, content) {
			var destDir = path.dirname(this.dest);
			var srcDir = path.dirname(fpath);
			var cwd = process.cwd();

			_.each(content, function (files, pathTo) {
				if (!_.isArray(files)) {
					files = [files];
				}
				_.each(files, function (file) {
					var name = path.basename(file);
					if (/^\//.test(file)) {
						file = cwd + file;
					} else {
						file = srcDir + file;
					}
					var dest = destDir + '/' + (pathTo === '.' || !pathTo ? '' : pathTo  + '/') + name;
					dest = dest.replace(/\/+/, '/');
					grunt.file.copy(file, dest);

					grunt.log.ok(file.replace(cwd, '') + ' ---> ' + dest.replace(cwd, ''));
				});
			});
		});

	});
};