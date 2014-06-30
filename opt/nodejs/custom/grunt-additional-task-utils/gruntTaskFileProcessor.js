"use strict";

var grunt = require('grunt');
var _ = require('lodash');


var save = function (caller, options, fpath) {
	if (caller.result != null || options.emptyResult) {
		if (!caller.dest) {
			grunt.fail.fatal('invalid destination');
			return;
		}

		var files = options.splittingIntoFiles.call(caller, caller.result, caller.dest);

		_.each(files, function (content, file) {
			content = options.processResult.call(caller, content, caller.dest);
			if (!_.isString(content) && !_.isNumber(content)) {
				content = JSON.stringify(content, null, options.beautifyJSON ? 4 : null);
			}
			grunt.file.write(file, content);
			if (options.okMessage) {
				grunt.log.ok(options.okMessage.call(caller, file, fpath));
			}
		});
	}
};

var mkCaller = function (file) {
	if (file.orig.overwrite) {
		file.dest = file.src;
	}
	return {
		src: file.src,
		dest: file.dest,
		orig: file.orig,
		result: null
	};
};

var iterator = function (callback, caller, options, fpath, file) {
	var content = options.readFile.call(caller, fpath, options.readOptions);
	content = options.processContent.call(caller, content, fpath, caller.dest);
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

	var mOptions = {

		blockMode: false,

		beautifyJSON: false,

		emptyResult: false,

		readOptions: {},

		eachCallback: function (fpath, content) {
			return content;
		},

		readFile: function (fpath, readOptions) {
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

			dest = (dest||'').replace(/^[\\\/]+/, '/').replace(cwd, '').replace(/^[\\\/]+/, '');
			fpath = (fpath||'').replace(/^[\\\/]+/, '/').replace(cwd, '').replace(/^[\\\/]+/, '');

			return 'File ' + dest + (fpath === dest ? ' processed' : ' created');
		},

		splittingIntoFiles: function (content, dest) {
			var obj = {};
			obj[dest] = content;
			return obj;
		}

	};

	return {

		configure: function (options) {
			_.each(options, function (v, k) {
				if (v != null) {
					mOptions[k] = v;
				}
			});
		},

		options: function () {
			return this.configure.apply(this, arguments);
		},

		each: function (callback) {
			var options = mOptions;

			if (!callback) {
				callback = options.eachCallback;
			}

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