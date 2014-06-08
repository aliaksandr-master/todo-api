(function(root, factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
		define(['underscore'], function(_) {
			return factory(_);
		});
	} else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = factory(root, require('underscore'));
	} else {
		root.SpecGenerator = factory(root._);
	}
}(this, function(_) {
	'use strict';

	var SpecGenerator = function (options) {
		this.options = _.extend({
			templates: {},
			types: {}
		}, options);
		this._elements = {};
	};

	SpecGenerator.prototype = {

		COVER_TYPE: 'cover',

		WRAPPER_TYPE: 'wrapper',

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

		findValues: function ($container) {
			var values = {};
			$container
				.find('[name]').filter('input, textarea, select')
				.each(function (index, element) {
					var $el = $container.find(element);
					if ($el.is(':checkbox') && !$el.is(':checked')) {
						values[element.name] = false;
						return;
					} else if ($el.is(':radio')) {
						if (values[element.name] != null) {
							return;
						}
						$el = $container.find('[name="' + $el.attr('name') + '"]:checked:radio');
						if (!$el.length) {
							return;
						}
					}
					values[element.name] = $el.val();
				});
			return values;
		},

		serialize: function ($container, bySpec, convert) {
			this._compile();
			bySpec = Boolean(bySpec);
			var valObj = {};
			var values = this.findValues($container);
			_.each(values, function (value, name) {
				var segments,
					element,
					_valObj = valObj;

				if (bySpec && value !== undefined) {
					element = this._elements[name];
					if (!element) {
						return;
					}
					if (_.isFunction(element.convert) && (convert || convert === undefined)) {
						value = element.convert(value, name, $container);
					}
				}

				if (value === undefined) {
					return;
				}

				segments = this._splitName(name);

				_.each(segments, function (segm, k) {
					if (segments.length === k + 1) {
						_valObj[segm] = value;
					} else {
						if (_valObj[segm] === undefined) {
							_valObj[segm] = /^\d+$/.test(segments[k+1]) ? [] : {};
						}
						_valObj = _valObj[segm];
					}
				}, this);
			}, this);

			return valObj;
		},

		render: function (spec, value) {
			this._compiled = null;
			this.spec = {
				type: this.WRAPPER_TYPE,
				nested: spec,
				$$$skip$$$: true
			};
			this.value = value || {};

			return this.template(this._typeOptions(this.WRAPPER_TYPE).template, {
				value: this._compile()
			});
		},

		_typeOptions: function (name) {
			if (this.options.types[name] == null) {
				throw new Error('FORM GENERATOR: undefined type "' + name + '"');
			}
			return this.options.types[name];
		},

		_genNested: function (spec, value, key) {
			return _.map(spec.nested, function (sp) {
				var name, val, element;

				if (sp.name && _.isString(sp.name)) {
					name    = sp.name;
					element = sp;
				} else {
					name    = _.keys(sp)[0];
					element = sp[name];
				}

				if (typeof element === 'string') {
					element = { type: element };
				}
				if (_.isArray(element)) {
					element = {
						nested: element
					};
				}
				name.replace(/^(.+?):([^:]*)$/, function (w, _name, _type) {
					element = _.extend(element || {}, {
						type: _type
					});
					name = _name;
				});

				if (/^#/.test(name)) {
					name = name.replace('#', '');
					element.$$$skip$$$ = true;
					element.type || (element.type = this.COVER_TYPE);
				}

				element.name = name;

				val = value !== null && typeof value === 'object' ? value[name] : undefined;
				val = val === null ? undefined : val;

				element.value = val === undefined ? (this._isNested(element) ? {} : undefined) : val;

				element || (element = {});
				return this._gen(element, spec, key);
			}, this);
		},

		template: function (name, data) {
			if (this.options.templates[name] == null) {
				throw new Error('FORM GENERATOR: undefined template "' + name + '"');
			}
			return this.options.templates[name](data);
		},

		_isNested: function (element) {
			return element.nested != null && element.nested !== false && element.nested !== 0;
		},

		_gen: function (element, parent, key) {
			if (/^[\d\w]/i.test(parent.name) && !parent.$$$skip$$$ && !element.$$$skip$$$) {
				element.name = parent.name + (key == null ? '' : '[' + key +']') + '[' + element.name + ']';
			}

			element = _.extend({}, this._typeOptions(element.type), element);

			if (this._isNested(element)) {
				if (element.array) {
					var v = _.isEmpty(element.value) ? [undefined]: element.value;
					element.value = _.map(v, function (value, key) {
						var _elem =_.extend({}, element, {
							value: this._genNested(element, value, key)
						});
						return this.template(element.template, _elem);
					}, this);
				} else {
					element.value = this._genNested(element, element.value);
				}
			} else {
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