"use strict";

var grunt = require('grunt');
var _ = require('lodash');


var save = function (caller, options, fpath) {
	if (caller.result != null || options.emptyResult) {
		if (!caller.dest) {
			grunt.fail.fatal('invalid destination');
			return;
		}
		caller.result = options.processResult(caller.result, caller.dest);
		if (!_.isString(caller.result) && !_.isNumber(caller.result)) {
			caller.result = JSON.stringify(caller.result, null, options.beautifyJSON ? 4 : null);
		}
		grunt.file.write(caller.dest, caller.result);
		if (options.okMessage) {
			grunt.log.ok(options.okMessage(caller.dest, fpath));
		}
	}
};

var mkCaller = function (file) {
	return {
		src: file.src,
		dest: file.dest,
		orig: file.orig,
		result: null
	};
};

var iterator = function (callback, caller, options, fpath, file) {
	var content = options.readFile(fpath);
	content = options.processContent(content, fpath, caller.dest);
	var objRes = caller.result;
	var result = callback.call(caller, fpath, content);
	if (result != null  && result !== caller.result) {
		caller.result = result;
	} else if (objRes === caller.result && result !== caller.result) {
		caller.result = result;
	}
	return caller;
};

module.exports = function (thisTaskObj) {

	var mOptions = {};

	return {

		configure: function (options) {

			mOptions = _.extend({

				beautifyJSON: false,

				emptyResult: false,

				readFile: function (fpath) {
					return null;
				},

				processContent: function (content, fpath, dest) {
					return content;
				},

				processResult: function (result, dest) {
					return result;
				},

				okMessage: function (dest, fpath) {
					var cwd = process.cwd().replace(/^[\\\/]+/, '/');
					dest = dest
						.replace(/^[\\\/]+/, '/')
						.replace(cwd, '')
						.replace(/^[\\\/]+/, '');
					return 'File ' + dest + (fpath === dest ? ' processed' : ' created');
				},

				dest: false

			}, mOptions, options);
		},

		each: function (callback) {
			var options = mOptions;

			var defaultKey = '-';
			var sortedFiles = {};
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
					var fp = _.cloneDeep(file);
					fp.src = fpath;
					var key = options.blockMode ? file.orig.dest : defaultKey;
					if (sortedFiles[key] == null) {
						sortedFiles[key] = [];
					}
					sortedFiles[key].push(fp);
				});
			});

			_.each(sortedFiles, function (files, dest) {
				if (options.blockMode) {
					var blockCaller = null;
					_.each(files, function (file) {
						if (blockCaller === null) {
							blockCaller = mkCaller(file);
							blockCaller.dest = dest;
						}
						blockCaller.src = file.src;
						iterator(callback, blockCaller, options, file.src, file);
					});
					if (options.blockMode && blockCaller != null) {
						save(blockCaller, options);
					}
				} else {
					_.each(files, function (file) {
						save(iterator(callback, mkCaller(file), options, file.src, file), options, file.src);
					});
				}
			});
		}
	};
};