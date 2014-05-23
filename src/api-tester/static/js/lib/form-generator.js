(function(root, factory) {
	"use strict";
	if (typeof define === 'function' && define.amd) {
		define(['lodash'], function(_) {
			return factory(_);
		});
	} else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = factory(root, require('lodash'));
	} else {
		root.SpecGenerator = factory(root._);
	}
}(this, function(_) {
	"use strict";

	var SpecGenerator = function (options, spec) {
		this.options = _.extend({
			templates: {},
			types: {}
		}, options);
		this.spec = { nested: spec };
		this._elements = {};
	};

	SpecGenerator.prototype = {

		getNames: function () {
			this._compile();
			return _.keys(this._elements);
		},

		_compile: function () {
			if (this._compiled === null) {
				this._compiled = this._genNested(this.spec, this.value);
			}
			return this._compiled;
		},

		_splitName: function (name) {
			var segments = [];
			name.replace(/^([^\[]+)((?:\[[^\]]+\])*)$/, function (w, segm, arrKey) {
				segments = [segm];
				arrKey.replace(/\[([^\]]+)\]/g, function (w, segm) {
					segments.push(segm);
				});
			});
			return segments;
		},

		getValueByName: function ($container, name) {
			var $el = $container.find('[name="' + name + '"]');
			return $el.length ? $el.val() : undefined;
		},

		serialize: function ($container, convert) {
			convert = convert == null ? true : Boolean(convert);
			var valObj = {};
			_.each(this._elements, function (element, name) {
				var segments,
					val = this.getValueByName($container, name),
					_valObj = valObj;

				if (val !== undefined && _.isFunction(element.convert) && convert) {
					val = element.convert(val);
				}

				if (val === undefined) {
					return;
				}

				segments = this._splitName(name);

				_.each(segments, function (segm, k) {
					if (segments.length === k + 1) {
						_valObj[segm] = val;
					} else {
						if (_valObj[segm] == null) {
							_valObj[segm] = /^\d+$/.test(segments[k+1]) ? [] : {};
						}
						_valObj = _valObj[segm];
					}
				}, this);
			}, this);
			return valObj;
		},

		render: function (templateName, value) {
			this._compiled = null;
			this.value = value;

			var tplData = {
				value: this._compile()
			};

			return this.template(templateName, tplData);
		},

		_genNested: function (spec, value, key) {
			return _.map(spec.nested, function (sp) {
				var name, val;
				name  = _.keys(sp)[0];
				val = value !== null && typeof value === 'object' ? value[name] : undefined;
				return this._gen(name, sp[name], val === null ? undefined : val, spec, key);
			}, this);
		},

		template: function (name, data) {
			return this.options.templates[name](data);
		},

		_isNested: function (element) {
			return element.nested != null && element.nested !== false && element.nested !== 0;
		},

		_gen: function (name, element, value, parent, key) {
			if (typeof element === 'string') {
				element = { type: element };
			}

			if (this._isNested(parent) && parent !== this.spec && /^[\d\w]/i.test(parent.name)) {
				name = parent.name + (key == null ? '' : '[' + key +']') + '[' + name + ']';
			}

			element = _.extend({}, this.options.types[element.type], element);

			element.name = name;
			element.value = value == null ? (this._isNested(element) != null ? {} : null) : value;

			if (this._isNested(element) != null) {
				if (element.array) {
					var v = _.isEmpty(element.value) ? [null]: element.value;
					element.value = _.map(v, function (value, key) {
						var _elem =_.clone(element);
						_elem.value = this._genNested(element, value, key);
						return this.template(element.template, _elem);
					}, this);
				} else {
					element.value = this._genNested(element, element.value);
				}
			}

			if (!this._isNested(element)) {
				if (this._elements[element.name]) {
					throw new Error('duplicate element name "' + element.name + '"');
				}
				this._elements[element.name] = element;
			}
			return this.template(element.template, element);
		}
	};

	return SpecGenerator;
}));