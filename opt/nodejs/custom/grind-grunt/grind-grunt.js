"use strict";

var _ = require('lodash');
var path = require('path');

var NAME_EXP = /^([^:]+):*(.*)$/;
var CWD = process.cwd();

var joinPaths = function (one, two) {
	return path.join(one == null ? '' : one + '', two == null ? '' : two + '').replace(/\\/g, '/').replace(/\/$/, '');
};

function Grind (grunt, fpath, options) {
	_.extend(this, options);
	this.$$prefix = fpath.replace(/\\+/g,'/').replace(/\.js$/, '').replace('/default', '');
	this.$$num = 0;
	this.$$grunt = grunt;
	this.$$sq = [];
	this.$$config = {};
	this.$$options = {};
	this.$$name = null;
	this.$$skip = false;
	this.$$refs = [];
}

var $$ALL = {};

Grind.prototype = {

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
			this.$$grunt.fail.fatal(this.$$prefix + ': Invalid tasks array in include');
		}

		if (_.isString(arrTasks)) {
			arrTasks = [arrTasks];
		}

		if (!_.isArray(arrTasks)) {
			this.$$grunt.fail.fatal(this.$$prefix + ': Invalid tasks type. Must be string or array');
		}

		this.$$sq = this.$$sq.concat(arrTasks);
		return this;
	},

	$$run: function (name, options, addToMain) {
		var that = this,
			$pref = that.$$prefix.replace(/^[\/]/, ''),
			target = $pref + '/' + (that.$$refs.length + 1),
			ref;

		this.$$addToMain(addToMain);
		if (!_.isObject(options) && !_.isArray(options) && !_.isFunction(options)) {
			this.$$grunt.fail.fatal(that.$$prefix + ': invalid config param of "' + name +'", must use array|object|function type');
		}

		name = name.replace(NAME_EXP, function (w, $1, $2) {
			target = $2.trim() ? joinPaths($pref, $2.trim()) : target;
			return $1.trim();
		});

		ref = name + ':' + target;

		that.$$refs.push(ref);

		if (that.$$config[name] == null) {
			that.$$config[name] = {};
		}

		that.$$config[name][target] = options;

		that.$$sq.push(ref);

		return this;
	}

};

var registerMulti = {};
var taskRegister = function (grunt, name, isMulti) {
	if (isMulti) {
		registerMulti[name] = registerMulti[name] == null;
	}
	var runnerName = 'RUN_' + name;
	Grind.prototype[runnerName] = function (targetName, config, addToMain) {
		if (!_.isString(targetName)) {
			addToMain = config;
			config = targetName;
			targetName = '';
		}
		targetName = targetName ? name + ':' + targetName : name;
		return this.$$run(targetName, config, addToMain);
	};
	if (Grind.prototype[name] != null && !registerMulti[name]) {
		grunt.log.warn('Use a "' + runnerName + '" name instead "' + name + '" to run task');
	} else {
		Grind.prototype[name] = Grind.prototype[runnerName];
	}
};

module.exports = function (grunt, options) {
	options || (options = {});

	options.modulesDir || (options.modulesDir = 'grunt');
	options.taskMethods  = options.taskMethods == null ? true : options.taskMethods;

	var registerTask = grunt.task.registerTask;
	grunt.task.registerTask = grunt.registerTask = function (taskName) {
		taskRegister(grunt, taskName, false);
		return registerTask.apply(this, arguments);
	};

	var registerMultiTask = grunt.task.registerMultiTask;
	grunt.task.registerMultiTask = grunt.registerMultiTask = function (taskName) {
		taskRegister(grunt, taskName, true);
		return registerMultiTask.apply(this, arguments);
	};

	return {
		run: function (context) {
			grunt.task.registerTask = grunt.registerTask = registerTask;
			grunt.task.registerMultiTask = grunt.registerMultiTask = registerMultiTask;

			context || (context = {});
			var config = {};

			var refs = {};
			var aliases = {};
			var modulesDir = joinPaths(CWD, options.modulesDir.replace(CWD, '').replace(/^.?[\/]]/, ''));
			grunt.file.expand({ cwd: modulesDir }, '**/*.js').forEach(function (fpath) {
				if (/^_|[\/\\]_/.test(fpath)) {
					return;
				}

				var grind = new Grind(grunt, fpath, context);

				var conf = require(joinPaths(modulesDir, fpath)).call(grind, grunt, context);

				if (conf != null) {
					_.extend(config, conf);
				}

				grind.$$name = grind.$$prefix;

				var nestedSq = [];
				_.each(grind.$$options, function (options, taskName) {
					if (grind.$$config[taskName] == null) {
						grunt.fail.fatal(grind.$$prefix + ' added options for undefined task "' + taskName +'"');
					}
					_.each(grind.$$config[taskName], function (v, k) {
						grind.$$config[taskName][k].options = _.extend({}, options, grind.$$config[taskName][k].options);
					});
				});

				_.each(grind.$$config, function (v, k) {
					if (config[k] == null) {
						config[k] = v;
						return;
					}
					_.each(v, function (_v, _k) {
						config[k][_k] = _v;
					});
				});

				if (grind.$$name) {
					grunt.task.registerTask(grind.$$name, grind.$$sq);
				}

				if (!grind.$$skip && grind.$$sq.length) {
					nestedSq = nestedSq.concat(grind.$$sq);
				}

				_.each(grind.$$refs, function (ref) {
					refs[ref] = true;
				});

				refs[grind.$$name] = true;
				aliases[grind.$$name] = nestedSq;
			});

			_.each($$ALL, function (v, k) {
				if (config[k] == null) {
					config[k] = {};
				}
				config[k].options = v;
			});

			_.each(aliases, function (tasks, name) {
				_.each(tasks, function (taskName) {
					if (!refs[taskName]) {
						grunt.fail.fatal(name + ': undefined task "' + taskName + '"');
					}
				});
				grunt.task.registerTask(name, tasks);
			});

			grunt.initConfig(config);
		}
	};
};