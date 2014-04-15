"use strict";

module.exports = function (grunt) {

	return function () {

		var _ = require('lodash');

		var options = this.options({
			files: [],
			outputJSON: '',
			deepMerge: true,
			beauty: true
		});

		var result = {};
		_.each(options.files, function (filepath) {
			var json = grun.file.readJSON(filepath);
			result = options.deepMerge ? _.merge(result, json) : _.extend(result, json);
		});

		grunt.file.write(options.outputJSON, JSON.stringify(result, null, options.beauty ? 4 : null));
		grunt.log.ok('file ' + options.outputJSON + ' was created!');
	}
};