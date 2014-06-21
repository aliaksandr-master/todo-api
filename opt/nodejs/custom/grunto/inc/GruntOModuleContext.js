"use strict";

var _ = require('lodash');
var utils = require('./utils');

function GruntOModuleContext (grunt, aliases, refs, config, prefix, context) {
	_.extend(this, context);

	aliases[prefix] = [];
	this.$prop$ = {
		grunt: grunt,
		prefix: prefix,
		sq: aliases[prefix],
		num: 0,
		config: config,
		refs: refs
	};
} GruntOModuleContext.prototype = {

	include: function (arrTasks) {
		if (_.isEmpty(arrTasks)) {
			this.$prop$.grunt.fail.fatal(this.$prop$.prefix + ': Invalid tasks array in include');
		}

		if (_.isString(arrTasks)) {
			arrTasks = [arrTasks];
		}

		if (!_.isArray(arrTasks)) {
			this.$prop$.grunt.fail.fatal(this.$prop$.prefix + ': Invalid tasks type. Must be string or array');
		}

		this.$prop$.sq = this.$prop$.sq.concat(arrTasks);
		return this;
	},

	$$run: function (name, config) {
		var that = this,
			$pref = this.$prop$.prefix,
			target = $pref + '/' + (++this.$prop$.num),
			ref;

		if (!_.isObject(config) && !_.isArray(config) && !_.isFunction(config)) {
			this.$prop$.grunt.fail.fatal(that.$prop$.prefix + ': invalid config param of "' + name +'", must use array|object|function type');
		}

		name = name.replace(/^([^:]+):*(.*)$/, function (w, $1, $2) {
			target = $2.trim() ? utils.joinPaths($pref, $2.trim()) : target;
			return $1.trim();
		});

		ref = name + ':' + target;

		that.$prop$.refs[ref] = true;

		if (that.$prop$.config[name] == null) {
			that.$prop$.config[name] = {};
		}

		that.$prop$.config[name][target] = config;

		that.$prop$.sq.push(ref);

		return this;
	}

};

module.exports = GruntOModuleContext;