define(function(require, exports, module){
    "use strict";

	var _ = require('lodash');

	var SpecFormCompiler = function (options) {
		this.options = _.extend({
			formTemplateName: 'form',
			templates: {},
			types: {},
			attr: function (name, spec) {
				return null;
			}
		}, options);
		this._compiled = false;
		this._names = [];
	};

	SpecFormCompiler.prototype = {

		setSpec: function (spec) {
			this.spec = { spec: spec };
			this._compiled = false;
			return this;
		},

		setValue: function (value) {
			this.value = value;
			this._compiled = false;
			return this;
		},

		getElementNames: function () {
			this._compile();
			return this._names;
		},

		_compile: function () {
			if (!this._compiled) {
				this._compiled = this._genNested(this.spec, this.value);
			}
			return this._compiled;
		},

		toString: function () {
			var formAttr = this.options.attr(null, null);

			var tplData = _.extend({
				value: this._compile()
			}, formAttr);

			return this._template(this.options.formTemplateName, tplData);
		},

		_genNested: function (spec, value, key) {
			return _.map(spec.spec, function (sp) {
				var name, val;
				name  = _.keys(sp)[0];
				val = value !== null && typeof value === 'object' ? value[name] : undefined;
				return this._gen(name, sp[name], val === null ? undefined : val, spec, key);
			}, this);
		},

		_template: function (name, data) {
			return this.options.templates[name](data);
		},

		_gen: function (name, element, value, parent, key) {
			if (typeof element === 'string') {
				element = { type: element };
			}

			if (parent.nested && /^[\d\w]/i.test(parent.name)) {
				name = parent.name + (key == null ? '' : '[' + key +']') + '[' + name + ']';
			}

			element = _.extend({}, element, this.options.types[element.type]);

			element.name = name;
			element.value = value == null ? (element.nested ? {} : null) : value;
			element.attr = this.options.attr(name, element);

			if (element.nested) {
				if (element.array) {
					var v = _.isEmpty(element.value) ? [null]: element.value;
					element.value = _.map(v, function (value, key) {
						var _elem =_.clone(element);
						_elem.value = this._genNested(element, value, key);
						return this._template(element.template, _elem);
					}, this);
				} else {
					element.value = this._genNested(element, element.value);
				}
			}

			this._names.push(element.name);
			return this._template(element.template, element);
		}
	};

    return SpecFormCompiler;
});