"use strict";
module.exports = function(grunt){

	return function () {
		var _ = require('lodash');
		var sha1 = require('sha1');
		var taskUtils = require('./_utils');

		var parsers = {
			js:   require('./_api-specs-compiler/_parsers/json'),
			json: require('./_api-specs-compiler/_parsers/json'),
			raml: require('./_api-specs-compiler/_parsers/raml') // not implemented
		};

		var mainOptions = this.options({
			specsOptions: '',
			source: true,
			beauty: false,
			verbose: false
		});

		var options = mainOptions.specsOptions ? require(mainOptions.specsOptions) : {};

		taskUtils.gruntFilterFiles(grunt, this, function (fpath, dest, fileObj) {
			var allowCondition = _.all(fpath.split(/[\\\/]+/), function (v) {
				return !/^_/.test(v);
			});
			if (allowCondition) {
				var ext = fpath.split('.').pop();
				var parsedObj = parsers[ext].call(grunt, fpath, options, mainOptions);

				if (mainOptions.source) {
					var sourceDir = fileObj.orig.dest.replace(/\/$/, '') + (_.isString(mainOptions.source) ? mainOptions.source : '-source');
					var sourceFile = sourceDir.replace(/\/$/, '') + '/' + dest.replace(fileObj.orig.dest, '').replace(/^\//, '');
					grunt.file.write(sourceFile, JSON.stringify(parsedObj.source, null, mainOptions.beauty ? 4 : null));
					grunt.log.ok('File ' + sourceFile + ' created');
				}

				grunt.file.write(dest, JSON.stringify(parsedObj.parsed, null, mainOptions.beauty ? 4 : null));
				grunt.log.ok('File ' + dest + ' created');
			}
		});
	};

};