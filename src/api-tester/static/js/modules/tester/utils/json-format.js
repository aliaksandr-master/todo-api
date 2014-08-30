define(function(require){
	'use strict';

	/* REQUIREMENTS */
	var BaseComponent = require('modules/tester/base/tester-component');
	var jsonFormat = require('packages/js-object-format/dist/json-format');
	require('css!opt/json-format/default-skin');
	var _ = require('lodash');

	/* APPLICATION */

	var JsonFormat =  BaseComponent.extend('JsonFormat', {

		init: function () {

		},

		format: function (obj, options, skin) {
			return jsonFormat.format(obj, _.extend({
				pref: 'fjson-' + (skin || 'compact') + '-'
			},options));
		},

		events: {
			'click .json-f-smpl':            'toggleValue',
			'click .json-f-key.json-f-v-it': 'toggleObject'
		},

		toggleValue: function (e, $el) {
			$el.toggleClass('-json-f-norm');
		},

		toggleObject: function (e, $el) {
			$el.toggleClass('-json-f-closed');
		}

	});

	return JsonFormat;
});