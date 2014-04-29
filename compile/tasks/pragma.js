"use strict";

module.exports = function (grunt) {

	grunt.task.registerMultiTask('pragma', function () {
		var _ = require('lodash');
		var fileFilterer = require('../utils/task/fileFilterer');
		var logFileOk = require('../utils/task/logFileOk');

		var options = this.options({

			processors: {},

			process: function (name, tagObj, fpath) {
				if (options.processors[name] != null) {
					var r = options.processors[name](tagObj, fpath);
					if (r != null) {
						return r;
					}
				}
				return tagObj.source;
			},

			pragma: [
				{
					regExp: /\/\*#:([^\s]+)(?:\s*\(([^\n\)]*?)\))?\*\/([\s\S]*?)\/\*\1#\*\//g,
					name:   1,
					attr:   2,
					inner:  3
				},
				{
					regExp: /\/\/#:([^\s]+)(?:\s*\(([^\n\)#]*?)\)).*?([\s\S]*?)\/\/\1#.*/g,
					name:   1,
					attr:   2,
					inner:  3
				},
				{
					regExp: /\/\*\s*#:([^\s]+)(?:\s*\(([^\n\)]*?)\))?#\s*\*\//gm,
					name:   1,
					attr:   2,
					inner:  null
				},
				{
					regExp: /\/\/#:([^\s]+)(?:\s*\(([^\n\)#]*?)\))?.*$#/gm,
					name:   1,
					attr:   2,
					inner:  null
				},
			]
		});

		options.pragma = _.result(options, "pragma");

		if (!_.isArray(options.pragma) && _.isObject(options.pragma)) {
			options.pragma = [options.pragma];
		}

		options.processors = _.result(options, 'processors');

		var utils = {
			parsePart: function (exp, args) {
				var source = args[0],
					name   = args[exp.name],
					attrStr   = args[exp.attr]  == null ? '' : args[exp.attr],
					innerStr  = args[exp.inner] == null ? '' : args[exp.inner];

				if (name == null) {
					grunt.fail.fatal('pragma expression incorrect. undefined name');
					return null;
				}

				var params = [];
				attrStr.replace(/(['"])(.*?)\1|([^\s,]+)/g, function ($0, dash, str, dec) {
					var arg = ((dec === '' || dec == null) ? str : dec + '').trim().replace(/^(['"])(.*?)\1$/, '$2');
					if (/^\d+$/.test(arg)) {
						arg = Number(arg);
					}
					params.push(arg);
				});

				return {
					source: source,
					name: name,
					params: params,
					inner: innerStr
				};
			},
			parse: function (content) {
				var that = this,
					tags = [];

				if (!content) {
					return tags;
				}

				_.each(options.pragma, function (exp) {
					content.replace(exp.regExp, function () {
						var pars = that.parsePart(exp, arguments);
						if (pars != null) {
							tags.push(pars);
						}
					});
				});

				return tags;
			}
		};

		var processUtils = {};

		fileFilterer(grunt, this, function (fpath, dest, fileObj) {
			var phpFileContent = grunt.file.read(fpath);

			var tags = utils.parse(phpFileContent);
			var resultPhpFileContent = phpFileContent;
			_.each(tags, function (tagObj) {
				var ex = options.process(tagObj.name, tagObj, fpath);
				resultPhpFileContent = resultPhpFileContent.replace(tagObj.source, ex);
			});
			if (phpFileContent !== resultPhpFileContent) {
				grunt.file.write(dest, resultPhpFileContent);
				logFileOk(dest, 'processed', 'File');
			}
		});
	});
};