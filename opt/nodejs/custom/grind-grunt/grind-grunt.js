"use strict";

var _ = require('lodash');
var path = require('path');

var NAME_EXP = /^([^:]+)\:?(.*)$/;
var CWD = process.cwd();

var joinPaths = function (one, two) {
	return path.join(one == null ? '' : one + '', two == null ? '' : two + '').replace(/\\/g, '/').replace(/\/$/, '');
};

var parseName = function (str, pref) {
	var res = {};
	str.replace(NAME_EXP, function (w, $1, $2) {
		res.name = $1;
		res.target = joinPaths(pref, $2).replace(/^[\/]/, '');
	});
	return res;
};


function GrindSequence (prefix, isSys) {
	this.$$sys = !!isSys;
	this.$$prefix = prefix;
	this.$$sq = [];
	this.$$config = {};
	this.$$opts = {};
	this.$$name = null;
	this.$$skip = false;
}

GrindSequence.prototype = {

	$$addToMain: function (addToMain) {
		if (this.$$skip || addToMain == null) {
			return;
		}
		this.$$skip = !addToMain;
	},

	$$all: {},

	options: function (taskName, options, isGlobal) {
		isGlobal = isGlobal || false;
		taskName = taskName.replace(NAME_EXP, '$1').trim();
		var taskObj = {};
		taskObj[taskName] = options;

		if (isGlobal) {
			_.merge(this.$$all, taskObj);
		} else {
			_.merge(this.$$opts, taskObj);
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

		this.$$sq = this.$$sq.concat(arrTasks);
		return this;
	},

	run: function (name, options, addToMain) {
		this.$$addToMain(addToMain);
		if (!_.isObject(options) && !_.isArray(options) && !_.isFunction(options)) {
			throw new Error(this.$$prefix + ': invalid config param of "' + name +'", must use array|object|function type');
		}

		var runner = parseName(name, this.$$prefix);

		var ref = runner.name + ':' + runner.target;

		var taskConfig = {};
		taskConfig[runner.name] = {};
		taskConfig[runner.name][runner.target] = options;
		if (this.$$config[runner.name] && this.$$config[runner.name][runner.target] != null) {
			throw new Error(this.$$prefix + ': Duplicate config name "' + ref + '"');
		}
		_.merge(this.$$config, taskConfig);
		this.$$sq.push(ref);
		return this;
	},

	alias: function (name, addToMain) {
		this.$$addToMain(addToMain);
		if (this.$$name != null) {
			throw new Error('Rename "' + this.$$name + '" to "' + name + '" impossible!');
		}
		this.$$name = joinPaths(this.$$prefix, name).replace(/^[\/]/, '');
		return this;
	}

};

function Grind (prefix, options) {
	_.extend(this, options);
	this.$$prefix = prefix;
	this.$$nested = [];
	this.$$main = new GrindSequence(this.$$prefix);
}

Grind.prototype = {

	_$mkGrind: function (isSys) {
		var sq = new GrindSequence(this.$$prefix, isSys);
		this.$$nested.push(sq);
		return sq;
	},

	run: function (taskName, config, addToMain) {
		var sq = this._$mkGrind();
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
			throw new Error(this.$$prefix + ': invalid name type');
		}
		var sq = this._$mkGrind(!name);
		sq.alias(name, addToMain);
		sq.add(tasks);
		return sq;
	},

	options: function (taskName, options, opt) {
		this.$$main.options(taskName, options, opt);
		return null;
	}

};

function filterator (grunt, cwd, callback, obj) {
	cwd = joinPaths(CWD, cwd.replace(CWD, '').replace(/^.?[\/]]/, ''));
	grunt.file.expand({ cwd: cwd }, '**/*.js').forEach(function (fpath) {
		if (!/^_|[\/\\]_/.test(fpath)) {
			callback.call(obj, joinPaths(cwd, fpath), fpath);
		}
	});
}

module.exports = function (grunt, options) {
	options || (options = {});

	options.modulesDir || (options.modulesDir = 'grunt');
	options.autoLoad = options.autoLoad == null ? true : options.autoLoad;
	options.runners  = options.runners == null ? true : options.runners;

	var tasks = [];

	if (options.runners) {
		var registerTask = grunt.task.registerTask;
		grunt.task.registerTask = grunt.registerTask = function (taskName) {
			tasks.push(taskName);
			return registerTask.apply(this, arguments);
		};

		var registerMultiTask = grunt.task.registerMultiTask;
		grunt.task.registerMultiTask = grunt.registerMultiTask = function (taskName) {
			tasks.push(taskName);
			return registerMultiTask.apply(this, arguments);
		};
	}

	if (options.autoLoad) {
		require('load-grunt-tasks')(grunt);
	}

	return {
		run: function (context) {
			context || (context = {});
			var config = {};

			_.each(tasks, function (name) {
				var runner = function (targetName, config, addToMain) {
					if (!_.isString(targetName)) {
						addToMain = config;
						config = targetName;
						targetName = '';
					}
					targetName = targetName ? name + ':' + targetName : name;
					return this.run(targetName, config, addToMain);
				};
				GrindSequence.prototype['RUN_' + name] = Grind.prototype['RUN_' + name] = runner;
				if (!GrindSequence.prototype[name] && !Grind.prototype[name]) {
					GrindSequence.prototype[name] = Grind.prototype[name] = runner;
				}
			});

			filterator(grunt, options.modulesDir, function (absPath, fpath) {
				var prefix = fpath.replace(/\.js$/, '').replace(/([^\/]+)\/\1$/, '$1');

				var grind = new Grind(prefix, context);

				require(absPath).call(grind, grunt, context);

				if (!grind.$$main.$$name) {
					grind.$$main.alias();
				}

				var nestedSq = [];
				_.each(grind.$$nested, function (grindSq, index) {

					_.each(grindSq.$$opts, function (options, taskName) {
						if (grindSq.$$config[taskName] == null) {
							throw new Error('undefined task name "' + taskName +'" in config for add options ' + JSON.stringify(options));
						}
						_.each(grindSq.$$config[taskName], function (v, k) {
							grindSq.$$config[taskName][k].options = _.extend({}, options, grindSq.$$config[taskName][k].options);
						});
					});

					_.each(grindSq.$$all, function (v, k) {
						if (config[k] == null) {
							config[k] = {};
						}
						config[k].options = _.extend({}, v, config[k].options);
					});

					_.each(grindSq.$$config, function (v, k) {
						if (config[k] != null) {
							_.each(v, function (_v, _k) {
								config[k][_k] = _v;
							});
						} else {
							config[k] = v;
						}
					});

					if (grindSq.$$sys) {
						nestedSq = nestedSq.concat(grindSq.$$sq);
						return;
					}

					var sq = grindSq.$$sq;
					if (grindSq.$$name != null) {
						grunt.task.registerTask(grindSq.$$name, sq);
						if (!grindSq.$$skip && sq.length) {
							nestedSq.push(grindSq.$$name);
						}
					} else {
						if (!grindSq.$$skip && sq.length) {
							nestedSq = nestedSq.concat(sq);
						}
					}
				});

				grunt.task.registerTask(grind.$$main.$$name, nestedSq);
			});

			grunt.initConfig(config);
		}
	};
};