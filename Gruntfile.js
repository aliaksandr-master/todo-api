"use strict";

var _ = require('lodash');

var cwd = process.cwd();

var paths = {
	ROOT: cwd,
	SRC: cwd + '/src',
	DEPLOY: cwd + '/deploy',
	LOCAL: cwd + '/_local',
	COMPILE: cwd + '/compile',
	BUILD: cwd + '/build',
	TMP: cwd + '/tmp'
};

var mkLauncher = function (grunt, prefix) {

	var launcher = {
		grunt: grunt,
		prefix: prefix,
		path: paths,
		_configs: {},
		_aliases: {},
		_sequence: [],
		_mainAlias: false
	};

	var TARGET_EXP = /^([^:]+):([^:]+).*$/;

	launcher.config = function (name, targetObj, addPref, add2alias) {
		var targetName = '';

		if (TARGET_EXP.test(name)) {
			targetName = name.replace(TARGET_EXP, '$2');
			name = name.replace(TARGET_EXP, '$1');
		}

		if (addPref == null ? true : addPref) {
			targetName = this.prefix + (targetName ? '/' : '') + targetName;
		}

		if (add2alias == null ? true : add2alias) {
			this._sequence.push(name + ':' + targetName);
		}

		var obj = {};
		obj[targetName] = targetObj;

		if (this._configs[name] == null) {
			this._configs[name] = {};
		}

		if (!_.isEmpty(this._configs[name][targetName])) {
			this.grunt.fail.fatal('duplicate targen names "' + name + '.' + targetName + '"');
		}

		_.extend(this._configs[name], obj);

		return launcher;
	}.bind(launcher);

	launcher.alias = function (name, tasks, addPref, add2alias) {
		if (!_.isString(name)) {
			add2alias = addPref;
			addPref = tasks;
			tasks = name;
			name = '';
			this._mainAlias = true;
		}

		if (addPref == null ? true : addPref) {
			name = this.prefix + (name ? '/' : '') + name;
		}

		if (add2alias == null ? true : add2alias) {
			if (name !== this.prefix) {
				this._sequence.push(name);
			}
		}

		this._aliases[name] = tasks;

		return launcher;
	}.bind(launcher);

	return launcher;
};

module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt);

	var pkg = require(paths.ROOT + '/package.json');

	var config = {
			jshint: {
				options: grunt.file.readJSON('.jshintrc')
			}
		},
		options = {
			buildTimestamp: Date.now(),
			package: pkg,
			liveReload: {
				port: 35729,
				src: '//' + pkg.name + ':35729/livereload.js'
			}
		};
	var cwd;

	cwd = paths.COMPILE + '/';

	_.each(grunt.file.expand({ cwd: cwd }, 'tasks/**/*.js'), function (fpath) {
		_.all(fpath.split(/[\\\/]+/), function (v) {
			return !/^_.+$/.test(v) || /^_compile$/.test(v);
		}) && require(cwd + fpath)(grunt, options);
	});

	cwd = paths.COMPILE + '/modules/';

	_.each(grunt.file.expand({ cwd: cwd }, '**/*.js'), function (fpath) {
		var condition = _.all(fpath.split(/[\\\/]+/), function (v) {
			return !/^_.+$/.test(v);
		});
		if (condition) {
			var prefix = fpath.replace(/\.js$/, '').replace(/([^\/]+)\/\1$/, '$1');

			var launcher = mkLauncher(grunt, prefix);

			require(cwd + fpath).call(launcher, grunt, options);

			if (!launcher._mainAlias) {
				launcher.alias(launcher._sequence);
			}

			_.each(launcher._aliases, function (tasks, aliasName) {
				grunt.task.registerTask(aliasName, tasks);
			});

			config = _.merge(config, launcher._configs);

//			TESTING INFO
//			_.each(launcher._aliases, function (tasks, alias) {
//				grunt.log.ok(alias, '[' + tasks.join(', ') + ']');
//			});
//
//			_.each(launcher._configs, function (tasks, config) {
//				_.each(tasks, function (obj, target) {
//					grunt.log.error(config + ':' + target);
//				});
//			});
		}
	});

	grunt.initConfig(config);
};