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

		insertTo: function (name, data) {
			var $panel = this.$('#api-tester-'+name);
			$panel.find('.panel-body').html(data);
		},

		insertToRaw: function (name, raw, transformed) {
			raw = (raw == null ? '' : raw) + '';
			var $panel = this.$('#api-tester-'+name);
			$panel.find('.panel-body.-transformed').html(transformed);
			$panel.find('.panel-body.-raw').html(raw).attr('title', '  length: ' + raw.length + 'symbols  ');
		},

		buildTableByArray: function (data) {
			var body = '';
			var head = '';
			var headKeys = [];
			if (_.isArray(data)) {
				head = '<thead>';
				_.each(data, function (item, index) {
					head += '<tr>';
					_.each(item, function (value, key) {
						headKeys.push(key);
						head += '<th>' + key + '</th>';
					});
					head += '</tr>';
					return false;
				});
				head += '</thead>';
				body = '<tbody>';
				_.each(data, function (item, k) {
					body += '<tr>';
					_.each(headKeys, function (key) {
						console.log(item[key]);
						body += '<td>' + this.tester.modules.json.format(item[key]) + '</td>';
					}, this);
					body += '</tr>';
				}, this);
				body += '</tbody>';
			} else if (_.isObject(data)) {
				body = '<tbody>';
				_.each(data, function (item, key) {
					body += '<tr>';
					body += '<th width="1%" class="text-right">' + key + '</th>';
					body += '<td>' + this.tester.modules.json.format(item) + '</td>';
					body += '</tr>';
				}, this);
				body += '</tbody>';
			}
			return '<table class="table table-bordered">' + head + body + '</table>';
		},

		buildJSON: function (data) {
			if(_.isObject(data)){
				data = this.tester.modules.json.format(data);
			}
			return data;
		},

		insertToRawMlt: function (name, raw, transformed) {
			var $panel = this.$('#api-tester-'+name);
			$panel.find('.-raw-mlt-n-json').html(this.buildJSON(transformed));
			$panel.find('.-raw-mlt-n-table').html(this.buildTableByArray(transformed));
			$panel.find('.-raw-mlt-n-html').html(raw);
			$panel.find('.-raw-mlt-n-raw').text(raw);
		},

		toggleRawMlt: function (e, $el) {
			var $body = $el.closest('.panel').find('.panel-body');
			$body.hide();
			$body.filter('.-raw-mlt-' + $el.val()).show();
		},

		events: {
			'change .panel-raw-toggle :checkbox': 'toggleRaw',
			'change .panel-raw-select select': 'toggleRawMlt'
		}
	});

	return PanelComponent;
});