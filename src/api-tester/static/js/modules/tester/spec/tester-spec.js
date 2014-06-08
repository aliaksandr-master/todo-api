define(function(require){
	'use strict';

	var $ = require('jquery');
	var _ = require('lodash');
	var URI = require('URIjs/URI');
	var BaseComponent = require('modules/tester/base/tester-component');

	var SpecComponent =  BaseComponent.extend('SpecComponent', {

		events: {
			'change #api-tester-spec-name': 'changeSpecName'
		},

		init: function () {
			var current = this.tester.spec.current;
			this.$('#api-tester-spec-name').val(current.name);
			this.$('#api-tester-spec-reset').attr('href', this.getSpecUrl(current.name));
			this.$('#api-tester-spec-ctrl').html(current.controller);
			this.$('#api-tester-spec-action').html(current.action);
			this.$('#api-tester-spec-description').html(current.description || '');
		},

		getSpecUrl: function (specName) {
			specName = specName || this.tester.spec.current.name;
			var curUrl = URI(this.tester.location.path());
			curUrl.addQuery('spec', specName);
			return curUrl.toString();
		},

		changeSpecName: function () {
			var specName = this.$('#api-tester-spec-name').val();
			window.location.href = this.getSpecUrl(specName);
		}

	});

	return SpecComponent;
});