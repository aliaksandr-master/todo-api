define(function(require, exports, module){
    "use strict";

	var _ = require('lodash');

	var defaultOptions = {
		map: {},
		templates: {
			form: null
		},
		types: {},
		attr: function (name, spec) {
			return this.map[name];
		}
	};

	var SpecCompiler = function (options, params, spec, value) {
		this.options = options;
		this.params  = params;
		this.value   = value;
		this.spec    = spec;
	};

	SpecCompiler.prototype = {

		toString: function () {
			return this.template('form', _.extend({}, this.params, {
				value: this.generateNested({spec: this.spec}, this.value)
			}));
		},

		generateNested: function (spec, values, key) {
			return _.map(spec.spec, function (sp) {
				var k = _.map(sp, function (_, k) { return k; })[0];
				var v;
				if (values != null && _.isObject(values)) {
					v = values[k];
				}
				v = v == null ? null : v;
				return this.generate(k, sp[k], v, spec, key);
			}, this);
		},

		template: function (name, data) {
			return this.options.templates[name](data);
		},

		generate: function (name, spec, values, parent, key) {

			if (_.isString(spec)) {
				spec = { type: spec };
			}

			if (parent.nested && /^[a-zA-Z0-9_\[\]]+$/.test(parent.name)) {
				name = parent.name + (key == null ? '' : '[' + key +']') + '[' + name + ']';
			}

			spec = _.extend({}, spec, this.options.types[spec.type], {
				name: name
			});

			spec.value = values == null ? (spec.nested ? {} : null) : values;
			spec.attr = this.options.attr(name);

			if (spec.nested) {
				if (spec.array) {
					var v = _.isEmpty(spec.value) ? [null]: spec.value;
					spec.value = _.map(v, function (values, key) {
						var params =_.extend({}, spec, { value: this.generateNested(spec, values, key) });
						return this.template(spec.template, params);
					}, this);
				} else {
					spec.value = this.generateNested(spec, spec.value);
				}
			}
			return this.template(spec.template, spec);
		}
	};

    return {
		configure: function (options) {
			options = _.merge({}, defaultOptions, options);

			return {
				generate: function (params, spec, values) {
					var form = new SpecCompiler(options, params, spec, values);
					return form.toString();
				},
				options: options
			};
		}
	};
});