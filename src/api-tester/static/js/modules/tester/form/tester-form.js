define(function(require){
	"use strict";

	var $ = require('jquery');
	var _ = require('lodash');
	var URI = require('URIjs/URI');
	var template = require('lib/templater');
	var BaseComponent = require('modules/tester/base/tester-component');
	var SpecCompiler = require('lib/form-generator/form-generator');


	var stdFormGeneratorOptions = {
		templates: {
			field:   template('gen/field'),
			text:    template('gen/text'),
			flag:    template('gen/flag'),
			cover:   template('gen/cover'),
			wrapper: template('gen/wrapper'),
			custom:  template('gen/cover')
		},
		types: {
			text: {
				template: 'text'
			},
			string: {
				template: 'field'
			},
			decimal: {
				template: 'field',
				convert: function (val) {
					if (val.length) {
						return parseInt(val, 10);
					}
					return undefined;
				}
			},
			float: {
				template: 'field',
				convert: function (val) {
					if (val.length) {
						return parseFloat(val);
					}
					return undefined;
				}
			},
			integer: {
				template: 'field',
				convert: function (val) {
					if (val.length) {
						return parseInt(val, 10);
					}
					return undefined;
				}
			},
			boolean: {
				template: 'flag',
				convert: function (val) {
					val = /^\d+$/.test(val) ? Number(val) : val;
					return Boolean(val);
				}
			},
			wrapper: {
				template: 'wrapper'
			},
			cover: {
				template: 'cover'
			},
			object: {
				template: 'cover'
			},
			array: {
				array:    true,
				template: 'cover'
			}
		}
	};

	var FormComponent = BaseComponent.extend('FormComponent', {

		init: function () {

		},

		events: {
			'keyup     #api-tester-form-body input':     'submitOnEnter',
			'keyup     #api-tester-form-params input':   'submitOnEnter',
			'keyup     #api-tester-form-query input':    'submitOnEnter',
			'submit    #api-tester-form':                'submit',
			'click     #api-tester-form-submit':         'submit'
		},

		submitOnEnter: function (e, $e) {
			if (e.keyCode === 13) {
				$e.closest("form").submit();
			}
		},

		createFormGen: function () {
			return new SpecCompiler(stdFormGeneratorOptions);
		},

		getDataFromRegion: function (regionName, bySpec) {
			var $region = this.getRegionElement(regionName);
			return $region.data('formGen').serialize($region, bySpec == null ? true : bySpec);
		},

		getRegionElement: function (regionName) {
			return this.$('#api-tester-form-' + regionName.toLowerCase() + ' .panel-body-content');
		},

		submit: function () {
			var that = this;

			var requestObj = {
				time: Date.now()
			};

			var params = {};
			var options = this.tester.getOptions();

			params.type = this.$('#form-route-method').val();

			var url = new URI(this.$('#form-route-url').val());
			url.addQuery(this.getDataFromRegion('query', options.convert));
			if (options.debug) {
				url.addQuery('_debug', 'debug');
			}
			if (options.virtual) {
				url.addQuery('virtual', '1');
			}
			params.url = url.toString();

			params.dataType = $('#form-response-format').val();

			var data = this.getDataFromRegion('body', options.convert);

			var requestFormat = $('#form-request-format').val();

			if (params.type !== "GET") {
				params.contentType = requestFormat;
			}

			if (_.isEmpty(data)) {
				if (params.type !== "GET") {
					params.data = '{}';
				}
			} else {
				if (params.type === 'GET') {
					params.contentType = requestFormat;
				}
				params.data = JSON.stringify(data);
			}

			requestObj.params = params;

			this.tester.saveRequestParamsToUrl();

			this.tester.showRequestData(params.data, data);

			this.tester.modules.debug.clear();
			$.ajax(_.extend(params, {
				success: function (response, _$, jqXHR) {
					that.onRequestSuccess(requestObj, response, jqXHR);
				},
				error: function (jqXHR, status) {
					that.onRequestError(requestObj, jqXHR.responseText, jqXHR);
				}
			}));

			return false;
		},

		onRequestSuccess: function (requestObj, response, jqXHR) {
			this.tester.showErrors();
			this.tester.modules.debug.show(response);
			this.tester.showInfo(requestObj, response, jqXHR);
			this.tester.showResponse(jqXHR.responseText, response);
			this.tester.showHeaders(jqXHR);
		},

		onRequestError: function (requestObj, response, jqXHR) {
			var responseSrc = response;

			try {
				response = JSON.parse(response, true);
				this.tester.modules.debug.show(response);
			} catch (e) {
				response = responseSrc;
			}

			this.tester.showInfo(requestObj, response, jqXHR);
			this.tester.showResponse(jqXHR.responseText, response);
			this.tester.showHeaders(jqXHR);

			this.tester.showErrors('<div class="alert alert-danger">Error <b>' + jqXHR.status + '</b> <em>( ' + jqXHR.statusText + ' )</em></div>');
		}
	});

	return FormComponent;
});