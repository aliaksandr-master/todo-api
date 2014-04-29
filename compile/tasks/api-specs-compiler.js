"use strict";
module.exports = function(grunt){

	grunt.task.registerMultiTask('api-specs-compiler', function () {
		var _ = require('lodash');
		var sha1 = require('sha1');

		var fileFilterer = require('../utils/task/fileFilterer');
		var logFileOk = require('../utils/task/logFileOk');
		var jsonParser = require('./_api-specs-compiler/_parsers/json');
		var ramlParser = require('./_api-specs-compiler/_parsers/raml'); // not implemented

		var parsers = {
			js: jsonParser,
			json: jsonParser
//			raml: ramlParser
		};

		var options = this.options({});

		fileFilterer(grunt, this, function (fpath, dest, fileObj) {
			var allowCondition = _.all(fpath.split(/[\\\/]+/), function (v) {
				return !/^_/.test(v);
			});
			if (allowCondition) {
				var ext = fpath.split('.').pop();
				var parsedObj = parsers[ext].call(grunt, fpath, dest, options);

				if (options.source) {
					var sourceDir = fileObj.orig.dest.replace(/\/$/, '') + (_.isString(options.source) ? options.source : '-source');
					var sourceFile = sourceDir.replace(/\/$/, '') + '/' + dest.replace(fileObj.orig.dest, '').replace(/^\//, '');
					grunt.file.write(sourceFile, JSON.stringify(parsedObj.source, null, options.beauty ? 4 : null));
					logFileOk(sourceFile);
				}

				grunt.file.write(dest, JSON.stringify(parsedObj.parsed, null, options.beauty ? 4 : null));
				logFileOk(dest);
			}
		});
	});

};