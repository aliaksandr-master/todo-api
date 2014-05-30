define(function(require){
	'use strict';

	/* REQUIREMENTS */
	var $ = require('jquery');
	var _ = require('lodash');
	var BaseComponent = require('modules/tester/base/tester-component');

	/* APPLICATION */
	var PanelComponent = BaseComponent.extend('PanelComponent', {

		init: function () {

		},

		toggleRaw: function (e, $el) {
			var checked = $el.is(':checked');
			var $raw = $el.closest('.panel-raw');
			var $trBody = $raw.find('.panel-body.-transformed');
			var $rawBody = $raw.find('.panel-body.-raw');
			if (!checked) {
				$trBody.hide();
				$rawBody.show();
			} else {
				$trBody.show();
				$rawBody.hide();
			}
		},

		insertToRaw: function (name, raw, transformed) {
			raw = (raw == null ? '' : raw) + '';
			var $panel = this.$('#api-tester-'+name);
			$panel.find('.panel-body.-transformed').html(transformed);
			$panel.find('.panel-body.-raw').html(raw).attr('title', '  length: ' + raw.length + 'symbols  ');
		},

		events: {
			'change .panel-raw-toggle :checkbox': 'toggleRaw'
		}
	});

	return PanelComponent;
});