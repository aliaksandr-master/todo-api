define(function(require){
	'use strict';

	/* REQUIREMENTS */
	var BaseComponent = require('modules/tester/base/tester-component');
	var jsonFormat = require('lib/json-format');

	/* APPLICATION */

	var JsonFormat =  BaseComponent.extend('JsonFormat', {

		init: function () {

		},

		refresh: function () {

		},

		format: function (obj, options) {
			return jsonFormat(obj, options);
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