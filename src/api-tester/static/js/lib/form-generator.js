define(function(require, exports, module){
    "use strict";

	var _ = require('lodash');

	var SpecFormCompiler = function (options, spec) {
		this.options = _.extend({
			mainTemplateName: 'form',
			templates: {},
			types: {}
		}, options);
		this.spec = { nested: spec };
		this._elements = {};
	};

	SpecFormCompiler.prototype = {

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

		serialize: function ($container, convert) {
			convert = convert == null ? true : Boolean(convert);
			var valObj = {};
			_.each(this._elements, function (type, name) {
				var segments = [],
					$el = $container.find('[name="' + name + '"]'),
					val = $el.val(),
					_valObj = valObj;

				if ($el.length) {
					val = convert ? this.convert(val, type) : val;
				} else {
					return;
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

		convert: function (val, type) {
			if (_.isFunction(this.options.types[type].convert)) {
				return this.options.types[type].convert(val);
			}
			return val;
		},

		render: function (value) {
			this._compiled = null;
			this.value = value;

			var tplData = {
				value: this._compile()
			};

			return this.template(this.options.mainTemplateName, tplData);
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
				this._elements[element.name] = element.type;
			}
			return this.template(element.template, element);
		}
	};

    return SpecFormCompiler;
});