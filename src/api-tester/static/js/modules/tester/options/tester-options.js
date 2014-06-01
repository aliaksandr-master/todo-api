define(function(require){
	"use strict";

	var $ = require('jquery');
	var _ = require('lodash');
	var BaseComponent = require('modules/tester/base/tester-component');

	var OptionsComponent =  BaseComponent.extend('OptionsComponent', {

		events: {
			'change #api-tester-options-wr [name]': 'refresh'
		},

		options: {
			debug:          {selector: '[name="option-debug"]',          default: true},
			convert:        {selector: '[name="option-convert"]',        default: true},
			debugInfo:      {selector: '[name="option-debug-info"]',     default: true},
			virtual:        {selector: '[name="option-debug-virtual"]',  default: false},
			ignoreRequired: {selector: '[name="option-ignore-require"]', default: false},
			limit:			{selector: '[name="option-limit"]', default: ''},
			offset:			{selector: '[name="option-offset"]', default: ''}
		},

		_memo: null,

		init: function () {
		},

		refresh: function () {
			this._memo = null;
			this._memo = this._init(null);
		},

		load: function (params) {
			this.set(params);
		},

		save: function () {
			return this.get();
		},

		get: function () {
			if (this._memo) {
				return this._memo;
			}
			this._memo = this._init(null);
			return this._memo;
		},

		set: function (values) {
			this._memo = null;
			this._memo = this._init(values);
			return this._memo;
		},

		reset: function () {
			this._memo = this._init(true);
			return this._memo;
		},

		_init: function (values) {
			var reset = values === true;
			values = reset || values == null || !_.isObject(values) ? {} : values;
			var $options = this.$('#api-tester-options-wr');
			var options = {};
			_.each(this.options, function (opt, optionName) {
				if (reset) {
					values[optionName] = opt.default;
				}
				var $option = $options.find(opt.selector);
				options[optionName] = values[optionName];
				if ($option.is(':checkbox')) {
					if (values[optionName] != null) {
						$option
							.prop('checked', Boolean(values[optionName]))
							.attr('checked', Boolean(values[optionName]));
					} else {
						options[optionName] = $option.is(':checked');
					}
				} else if ($option.is(':radio')) {
					if (values[optionName] != null) {
						$option
							.prop('checked', false)
							.attr('checked', false)
							.filter('[value="' + values[optionName] +'"]')
								.eq(0)
								.prop('checked', true)
								.attr('checked', true);
					} else {
						options[optionName] = $option.filter(':checked').val();
					}
				} else {
					if (values[optionName] != null) {
						$option.val(values[optionName]);
					} else {
						options[optionName] = $option.val();
					}
				}
			});
			return options;
		}

	});

	return OptionsComponent;
});