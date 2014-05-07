"use strict";

var _ = require('lodash');

function GrumbleSq (grumble) {
	this._grumble = grumble;
	this._sq = [];
	this._skip = [];
	this._config = {};
	this._opts = {};
	this._name = null;
}

var NAME_EXP = /^([^:]+)\:(.*)$/;

GrumbleSq.prototype = {

	_all: {},

	options: function (taskName, options, isGlobal) {
		isGlobal = isGlobal || false;
		taskName = taskName.replace(NAME_EXP, '$1').trim();
		var taskObj = {};
		taskObj[taskName] = options;

		if (isGlobal) {
			_.merge(this._all, taskObj);
		} else {
			_.merge(this._opts, taskObj);
		}

		return this;
	},

	then: function (taskName, config, addToMain) {
		addToMain = addToMain == null ? true : addToMain;
		taskName = taskName.replace(NAME_EXP, '$1').trim();
		var targetName = taskName.replace(NAME_EXP, '$2').trim();
		var name = taskName + ':' + targetName;
		var taskConfig = {};
		taskConfig[taskName] = {};
		taskConfig[taskName][targetName] = config;
		if (this._all[taskName][targetName] != null) {
			throw new Error('Duplicate config name "' + name + '"');
		}
		_.merge(this._config, taskConfig);
		this._sq.push(name);
		if (!addToMain) {
			this._skip.push(name);
		}
		return this;
	},

	run: function () {
		return this.then.apply(this, arguments);
	},

	assign: function (name, addToMain) {
		addToMain = addToMain == null ? true : addToMain;
		if (this._name != null) {
			throw new Error('Rename "' + this._name + '" to "' + name + '" impossible!');
		}
		this._name = this._grumble._prefix + (name != null ? '/' : '') + name;
//		if (this.) {
//
//		}
		return this;
	}

};

function Grumble (prefix, options) {
	this._$$prefix = prefix;
	this._$$main = new GrumbleSq(this);
	this._$$main._sqq = [];

	_.extend(this, options || {});
}

Grumble.prototype = {

	run: function (taskName, config, addToMain) {
		var sq = new GrumbleSq(this);
		this._$$main._sqq.push(sq);
		if (arguments.length === 1 || (arguments.length === 2 && _.isBoolean(arguments[1]))) {
			sq.assign(taskName, config, addToMain);
		} else {
			sq.then(taskName, config, addToMain);
		}
		return sq;
	},

	alias: function (name, tasks) {
		this._$$main._sqq.push(sq);
	},

	options: function (taskName, options, opt) {
		this._$$main.options(taskName, options, opt);
		return null;
	},

	rename: function (newName) {
		this._$$main.assign(newName);
		return null;
	}

};

module.exports = function (grunt, params, contextParams) {
	params =
	var cwd = path.join(process.cwd(), params.cwd);
	var tasks = path.join(cwd, params.tasks);

	_.each(grunt.file.expand({ cwd: cwd }, 'tasks/**/*.js'), function (fpath) {
		_.all(fpath.split(/[\\\/]+/), function (v) {
			return !/^_.+$/.test(v);
		}) && require(cwd + fpath)(grunt, options);
	});

};