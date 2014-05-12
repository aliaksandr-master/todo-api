"use strict";

var _ = require('lodash');
var path = require('path');

var NAME_EXP = /^([^:]+)\:?(.*)$/;

var joinPaths = function () {
	var result = '';
	_.each(arguments, function (arg) {
		if (!_.isEmpty(arg)) {
			var pt = arg.replace(/[\/\\]+/g, '/').replace(/^\/|\/$/g, '');
			result += (result && pt ? '/' : '') + pt;
		}
	});
	return result.replace(/[\/\\]+/g, '/');
};

var parseName = function (str, pref) {
	return {
		name: str.replace(NAME_EXP, '$1'),
		target: joinPaths(pref, str.replace(NAME_EXP, '$2'))
	};
};


function GrumbleSq (prefix, isSys) {
	this._$$sys = !!isSys;
	this._$$prefix = prefix;
	this._$$sq = [];
	this._$$config = {};
	this._$$opts = {};
	this._$$name = null;
	this._$$skip = false;
}

GrumbleSq.prototype = {

	_$$addToMain: function (addToMain) {
		if (this._$$skip || addToMain == null) {
			return;
		}
		this._$$skip = !addToMain;
	},

	_$$all: {},

	options: function (taskName, options, isGlobal) {
		isGlobal = isGlobal || false;
		taskName = taskName.replace(NAME_EXP, '$1').trim();
		var taskObj = {};
		taskObj[taskName] = options;

		if (isGlobal) {
			_.merge(this._$$all, taskObj);
		} else {
			_.merge(this._$$opts, taskObj);
		}

		return this;
	},

	add: function (arrTasks) {
		if (_.isEmpty(arrTasks)) {
			throw new Error('invalid tasks array (first argument) in add function');
		}

		if (!_.isArray(arrTasks)) {
			arrTasks = [arrTasks];
		}

		this._$$sq = this._$$sq.concat(arrTasks);
		return this;
	},

	then: function (name, options, addToMain) {
		this._$$addToMain(addToMain);
		if (!_.isObject(options) && !_.isArray(options) && !_.isFunction(options)) {
			throw new Error(this._$$prefix + ': invalid config param of "' + name +'", must use array|object|function type');
		}

		var runner = parseName(name, this._$$prefix);

		var ref = runner.name + ':' + runner.target;

		var taskConfig = {};
		taskConfig[runner.name] = {};
		taskConfig[runner.name][runner.target] = options;
		if (this._$$config[runner.name] && this._$$config[runner.name][runner.target] != null) {
			throw new Error(this._$$prefix + ': Duplicate config name "' + ref + '"');
		}
		_.merge(this._$$config, taskConfig);
		this._$$sq.push(ref);
		return this;
	},

	run: function () {
		return this.then.apply(this, arguments);
	},

	next: function () {
		return this.then.apply(this, arguments);
	},

	alias: function (name, addToMain) {
		this._$$addToMain(addToMain);
		if (this._$$name != null) {
			throw new Error('Rename "' + this._$$name + '" to "' + name + '" impossible!');
		}
		this._$$name = joinPaths(this._$$prefix, name);
		return this;
	}

};

function Grumble (prefix, options) {
	_.merge(this, options);
	this._$$prefix = prefix;
	this._$$nested = [];
	this._$$main = new GrumbleSq(this._$$prefix);
}

Grumble.prototype = {

	_$mkGrumble: function (isSys) {
		var sq = new GrumbleSq(this._$$prefix, isSys);
		this._$$nested.push(sq);
		return sq;
	},

	run: function (taskName, config, addToMain) {
		var sq = this._$mkGrumble();
		if (arguments.length === 1) {
			return sq.alias(taskName, addToMain);
		}
		return sq.run(taskName, config, addToMain);
	},

	add: function (tasks) {
		this.alias(tasks);
		return null;
	},

	alias: function (name, tasks, addToMain) {
		if (_.isArray(name)) {
			addToMain = tasks;
			tasks = name;
			name = '';
		}
		if (!_.isString(name)) {
			throw new Error(this._$$prefix + ': invalid name type');
		}
		var sq = this._$mkGrumble(!name);
		sq.alias(name, addToMain);
		sq.add(tasks);
		return sq;
	},

	options: function (taskName, options, opt) {
		this._$$main.options(taskName, options, opt);
		return null;
	}

};

var filterator = function (grunt, cwd, callback, obj) {
	cwd = cwd.replace(process.cwd(), '');
	cwd = process.cwd() + '/' + cwd.replace(/^.?\/|\/$/g, '') + '/';
	_.each(grunt.file.expand({
		cwd: cwd,
		filter: function (src) {
			return !/^_|\/_/.test(src);
		}
	}, '**/*.js'), function (fpath) {
		callback.call(obj, cwd + fpath, fpath);
	});
};

module.exports = function (grunt, options) {
	options || (options = {});

	var config = {};

	options = _.merge({
		tasksDir: null,
		modulesDir: null
	}, options);

	if (!options.modulesDir) {
		grunt.fail.fatal('options.modulesDir is undefined');
		return config;
	}

	if (!options.tasksDir) {
		grunt.fail.fatal('options.tasksDir is undefined');
		return config;
	}

	options.autoLoad = options.autoLoad || options.autoLoad == null ? true : false;

	filterator(grunt, options.tasksDir, function (absPath) {
		require(absPath)(grunt, options);
	});

	filterator(grunt, options.modulesDir, function (absPath, fpath) {
		var prefix = fpath.replace(/\.js$/, '').replace(/([^\/]+)\/\1$/, '$1');

		var grumble = new Grumble(prefix, options);

		require(absPath).call(grumble, grunt, options);

		if (!grumble._$$main._$$name) {
			grumble._$$main.alias();
		}

		var nestedSq = [];
		_.each(grumble._$$nested, function (grumbleSq, index) {

			_.each(grumbleSq._$$opts, function (options, taskName) {
				if (grumbleSq._$$config[taskName] == null) {
					throw new Error('undefined task name "' + taskName +'" in config for add options ' + JSON.stringify(options));
				}
				_.each(grumbleSq._$$config[taskName], function (v, k) {
					grumbleSq._$$config[taskName][k].options = _.extend({}, options, grumbleSq._$$config[taskName][k].options);
				});
			});

			_.each(grumbleSq._$$all, function (v, k) {
				if (config[k] == null) {
					config[k] = {};
				}
				config[k].options = _.extend({}, v, config[k].options);
			});

			_.each(grumbleSq._$$config, function (v, k) {
				if (config[k] != null) {
					_.each(v, function (_v, _k) {
						config[k][_k] = _v;
					});
				} else {
					config[k] = v;
				}
			});

			if (grumbleSq._$$sys) {
//				console.log('!!!', nestedSq);
				nestedSq = nestedSq.concat(grumbleSq._$$sq);
//				console.log('>!!', nestedSq);
				return;
			}

			var sq = grumbleSq._$$sq;
			if (grumbleSq._$$name != null) {
//				console.log('>>', grumbleSq._$$name, sq);
				grunt.task.registerTask(grumbleSq._$$name, sq);
				if (!grumbleSq._$$skip && sq.length) {
					nestedSq.push(grumbleSq._$$name);
				}
			} else {
				if (!grumbleSq._$$skip && sq.length) {
					nestedSq = nestedSq.concat(sq);
				}
			}
		});

//		console.log('!>', grumble._$$main._$$name, nestedSq);
		grunt.task.registerTask(grumble._$$main._$$name, nestedSq);
	});

//	console.log(config);
//	console.log(JSON.stringify(config, null, 4));
	if (options.autoLoad) {
		require('load-grunt-tasks')(grunt);
		grunt.initConfig(config);
	}

	return config;
};