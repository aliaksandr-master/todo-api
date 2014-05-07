"use strict";

var _ = require('lodash');

function Directive (name, obj) {
	this.name = name;
	this.need = false;
	this.default = undefined;
	_.extend(this, obj);
	this.nested = new DirectiveFactory();
	this.constructor();
}

Directive.prototype = {
	inherit: function (directiveKeyByDirectives, directiveKeyByCommon, directives) {
		var directiveData = null;
		var directiveName = directiveKeyByDirectives == null ? directiveKeyByCommon : directiveKeyByDirectives;
		if (directiveName != null) {
			directiveData = directives[directiveName];
			if (directiveKeyByDirectives) {
				delete directives[directiveKeyByDirectives];
			}
			if (directiveKeyByCommon) {
				delete directives[directiveKeyByCommon];
			}
		}
		return {
			value: directiveData,
			key: directiveName
		};
	},

	verify: function (directiveName, directiveData, apiName) {
	},

	check: function (directiveName) {
		return this.name === directiveName;
	},

	process: function (directiveName, directiveData, directives) {
		return directiveData;
	},

	constructor: function () {

	}
};

function DirectiveFactory () {
	this.directivesSq = [];
	this.directives = {};
}

DirectiveFactory.prototype = {

	directive: function (name, obj) {
		var directive = new Directive(name, obj);
		this.directivesSq.push(name);
		this.directives[name] = directive;
		return directive;
	},

	process: function (name, directives, options) {
		var directivesKeys = _.keys(directives);
		try {
			if (!this.directives[name]) {
				throw new Error('is undefined');
			}
			var specDirective = this.directives[name];
			var directiveKeyByCommon = null;
			var directiveKeyByDirectives = null;
			_.each(directivesKeys, function (key) {
				if (specDirective.check(key)) {

					if (_.isNull(directiveKeyByCommon) && options[key]) {
						directiveKeyByCommon = key;
					} else if (_.isNull(directiveKeyByDirectives)) {
						directiveKeyByDirectives = key;
					} else {
						throw new Error('must have one directive');
					}
				}
			}, this);

			var directive = specDirective.inherit(directiveKeyByDirectives, directiveKeyByCommon, directives);
			if (specDirective.need && _.isEmpty(directive.value) && directive.value !== false) {
				directive.key = null;
			}

			if (directive.key != null) {
				specDirective.verify(directive.key, directive.value, directives);
				directives[specDirective.name] = specDirective.process(directive.key, directive.value, directives);

				var nested = specDirective.nested.processAll(directive.value, {});
				directives[specDirective.name] = _.extend(directives[specDirective.name], nested);

			} else if (specDirective.need) {
				throw new Error('directive required');
			}

			if (directives[specDirective.name] === undefined && specDirective.default !== undefined) {
				directives[specDirective.name] = _.cloneDeep(specDirective.default);
			}
		} catch (e) {
			throw new Error(name + ': ' + e.message);
		}
		return directives[name];
	},

	processAll: function (directives, options) {
		var result = {};
		_.each(this.directivesSq, function (name) {
			result[name] = this.process(name, directives, options);
		}, this);
		return result;
	}
};

module.exports = {
	directive: Directive,
	factory: DirectiveFactory
};