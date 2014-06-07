"use strict";

var _ = require('lodash');
var path = require('path');

var NAME_EXP = /^([^:]+):*(.*)$/;
var CWD = process.cwd();

var joinPaths = function (one, two) {
	return path.join(one == null ? '' : one + '', two == null ? '' : two + '').replace(/\\/g, '/').replace(/\/$/, '');
};


function GrindSequence (prefix, isSys) {
	this.$$sys = !!isSys;
	this.$$prefix = prefix;
	this.$$sq = [];
	this.$$config = {};
	this.$$options = {};
	this.$$name = null;
	this.$$skip = false;
}

var $$ALL = {};

GrindSequence.prototype = {

	$$addToMain: function (addToMain) {
		if (this.$$skip || addToMain == null) {
			return;
		}
		this.$$skip = !addToMain;
	},

	options: function (taskName, options, isGlobal) {
		taskName = taskName.replace(NAME_EXP, '$1').trim();

		if (isGlobal) {
			$$ALL[taskName] = options;
		} else {
			this.$$options[taskName] = options;
		}

		return this;
	},

	include: function (arrTasks) {
		if (_.isEmpty(arrTasks)) {
			throw new Error(this.$$prefix + ' invalid tasks array (first argument) in include function');
		}

		if (!_.isArray(arrTasks)) {
			arrTasks = [arrTasks];
		}

		this.$$sq = this.$$sq.concat(arrTasks);
		return this;
	},

	run: function (name, options, addToMain) {
		var that = this,
			target = that.$$prefix.replace(/^[\/]/, ''),
			ref;

		this.$$addToMain(addToMain);
		if (!_.isObject(options) && !_.isArray(options) && !_.isFunction(options)) {
			throw new Error(this.$$prefix + ': invalid config param of "' + name +'", must use array|object|function type');
		}

		name = name.replace(NAME_EXP, function (w, $1, $2) {
			target = joinPaths(target, $2.trim());
			return $1.trim();
		});

		ref = name + ':' + target;

		if (this.$$config[name] && this.$$config[name][target] != null) {
			throw new Error(this.$$prefix + ': Duplicate config name "' + ref + '"');
		}

		if (this.$$config[name] == null) {
			this.$$config[name] = {};
		}

		this.$$config[name][target] = options;

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

function Grind (fpath, options) {
	_.extend(this, options);
	this.$$prefix = fpath.replace(/\.js$/, '');
	this.$$nested = [];
	this.$$main = new GrindSequence(this.$$prefix);
}

Grind.prototype = {

	$$mkGrind: function (isSys) {
		var sq = new GrindSequence(this.$$prefix, isSys);
		this.$$nested.push(sq);
		return sq;
	},

	run: function (taskName, config, addToMain) {
		var sq = this.$$mkGrind();
		if (arguments.length === 1) {
			return sq.alias(taskName, addToMain);
		}
		return sq.run(taskName, config, addToMain);
	},

	include: function (tasks) {
		if (tasks != null && !_.isArray(tasks)) {
			tasks = [tasks];
		}
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
		var sq = this.$$mkGrind(!name);
		sq.alias(name, addToMain);
		sq.include(tasks);
		return sq;
	},

	options: function (taskName, options, isGlobal) {
		this.$$main.options(taskName, options, isGlobal);
		return null;
	}

};

module.exports = function (grunt, options) {
	options || (options = {});

	options.modulesDir || (options.modulesDir = 'grunt');
	options.taskMethods  = options.taskMethods == null ? true : options.taskMethods;

	var tasks = [];

	if (options.taskMethods) {
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

	var addTasksMethodsToRunner = function () {
		if (!options.taskMethods) {
			return;
		}

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
	};

	return {
		run: function (context) {
			context || (context = {});
			var config = {};

			addTasksMethodsToRunner();

			var modulesDir = joinPaths(CWD, options.modulesDir.replace(CWD, '').replace(/^.?[\/]]/, ''));
			grunt.file.expand({ cwd: modulesDir }, '**/*.js').forEach(function (fpath) {
				if (/^_|[\/\\]_/.test(fpath)) {
					return;
				}

				var grind = new Grind(fpath, context);

				var conf = require(joinPaths(modulesDir, fpath)).call(grind, grunt, context);

				if (conf != null) {
					_.extend(config, conf);

				}

				if (!grind.$$main.$$name) {
					grind.$$main.alias();
				}

				var nestedSq = [];
				_.each(grind.$$nested, function (grindSq, index) {

					_.each(grindSq.$$options, function (options, taskName) {
						if (grindSq.$$config[taskName] == null) {
							throw new Error(grindSq.$$prefix + ' add options to undefined task "' + taskName +'"');
						}
						_.each(grindSq.$$config[taskName], function (v, k) {
							grindSq.$$config[taskName][k].options = _.extend({}, options, grindSq.$$config[taskName][k].options);
						});
					});

					_.each(grindSq.$$config, function (v, k) {
						if (config[k] == null) {
							config[k] = v;
							return;
						}
						_.each(v, function (_v, _k) {
							config[k][_k] = _v;
						});
					});

					if (grindSq.$$sys) {
						nestedSq = nestedSq.concat(grindSq.$$sq);
						return;
					}

					if (grindSq.$$name) {
						grunt.task.registerTask(grindSq.$$name, grindSq.$$sq);
					}

					if (!grindSq.$$skip && grindSq.$$sq.length) {
						var sq = grindSq.$$sq;
						if (grindSq.$$name) {
							sq = [grindSq.$$name];
						}
						nestedSq = nestedSq.concat(sq);
					}
				});

				grunt.task.registerTask(grind.$$main.$$name, nestedSq);
			});

			_.each($$ALL, function (v, k) {
				if (config[k] == null) {
					config[k] = {};
				}
				config[k].options = v;
			});

			grunt.initConfig(config);
		}
	};
};