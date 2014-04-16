"use strict";
module.exports = function(grunt){

	return function () {
		var _ = require('lodash');
		var sha1 = require('sha1');
		var taskUtils = require('./_utils');
		var jsonParser = require('./_api-specs-compiler/_parsers/json');
		var ramlParser = require('./_api-specs-compiler/_parsers/raml'); // not implemented

		var parsers = {
			js: jsonParser,
			json: jsonParser
//			raml: ramlParser
		};

		var options = this.options({});

		taskUtils.gruntFilterFiles(grunt, this, function (fpath, dest, fileObj) {
			var allowCondition = _.all(fpath.split(/[\\\/]+/), function (v) {
				return !/^_/.test(v);
			});
			if (allowCondition) {
				var ext = fpath.split('.').pop();
				var parsedObj = parsers[ext].call(grunt, fpath, options);

				if (options.source) {
					var sourceDir = fileObj.orig.dest.replace(/\/$/, '') + (_.isString(options.source) ? options.source : '-source');
					var sourceFile = sourceDir.replace(/\/$/, '') + '/' + dest.replace(fileObj.orig.dest, '').replace(/^\//, '');
					grunt.file.write(sourceFile, JSON.stringify(parsedObj.source, null, options.beauty ? 4 : null));
					taskUtils.logFileOk(sourceFile);
				}

				grunt.file.write(dest, JSON.stringify(parsedObj.parsed, null, options.beauty ? 4 : null));
				taskUtils.logFileOk(dest);
			}
		});
	};

};