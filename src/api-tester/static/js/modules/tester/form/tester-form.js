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
			this.buildForm();
			this.refreshFormats();
			this.refreshRouterUrl();
		},

		events: {
			'change    #form-route':                     'refreshRouterUrl',
			'keyup     #api-tester-form-params [name]':  'refreshRouterUrl',
			'change    #api-tester-form-params [name]':  'refreshRouterUrl',

			'keyup     #api-tester-form-body input':     'submitOnEnter',
			'keyup     #api-tester-form-params input':   'submitOnEnter',
			'keyup     #api-tester-form-query input':    'submitOnEnter',
			'submit    #api-tester-form':                'submit',
			'click     #api-tester-form-submit':         'submit'
		},

		refreshFormats: function () {
			var params = this.tester.load();

			if (!_.isEmpty(params.format)) {
				this.$('#form-request-format').val(params.format.request);
				this.$('#form-response-format').val(params.format.response);
			}
		},

		buildFormPart: function (formGen, $element, spec, values) {
			return formGen.render(_.map(spec, function (v) {
				return {
					name: v.name,
					label: v.name,
					type: v.type,
					required: v.validation.required
				};
			}), values);
		},

		refreshRouterUrl: function () {
			var params = this.tester.load();

			var routeId = this.$('#form-route').val();
			var route = this.tester.routes.current[routeId] || {};

			var root = window.API_ROOT.replace(/\/$/, '') + '/';

			var url = this.$('#form-route-url').val() || root;
			var method = this.$('#form-route-method').val() || 'GET';

			if (!_.isEmpty(route)) {
				var data = this.getDataFromRegion('params', false);
				url = this.reverseUrlByRoute(route, data);
				url = root + url.replace(/^\//, '');
				method = route.method;
			} else {
				url    = params.url || url;
				method = params.method || method;
			}

			this.$('#form-route-url').val(url);
			this.$('#form-route-method').val(method);
		},

		reverseUrlByRoute: function (route, data) {
			var url = route.reverse;
			_.each(data, function (v, k) {
				url = url.replace('<' + k + '>', v);
			});

			if (/<([^>]+)>/.test(url)) {
				throw new Error('invalid route params in reverse "' + url + '"');
			}

			return url;
		},

		buildForm: function () {
			if (_.isEmpty(this.tester.spec.current)) {
				return;
			}

			var params = this.tester.load();
			_.each(['body', 'params', 'query'], function (part) {
				var req = _.isEmpty(this.tester.spec.current.request) ? {} : this.tester.spec.current.request;
				var $element = this.tester.modules.form.getRegionElement(part);
				var formGen = this.tester.modules.form.createFormGen();
				var spec = (req.input || {})[part] || [];
				var values;
				if (params) {
					if (params.spec) {
						if (!_.isEmpty(params.spec[part])) {
							spec = params.spec[part];
						}
					}
					if (params.values) {
						if (params.values[part] != null) {
							values = params.values[part];
						}
					}
				}
				$element.html(this.buildFormPart(formGen, $element, spec, values));
				$element.data('formGen', formGen);
				$element.data('spec', spec);
			}, this);

			var counter = 0;
			var $formRouteSelect = $('#form-route');
			$formRouteSelect.html('');
			_.each(this.tester.routes.current, function (v) {
				$formRouteSelect.append($('<option/>').text(v.method + ' ' + v.reverse).attr('value', counter++));
			});
			$formRouteSelect.append($('<option/>').text('custom').attr('value', -1));
			$formRouteSelect.val(params.route || (counter ? 0 : -1));
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

			var customUrlParamsMode = this.$('#form-route').val() === '-1';

			var params = {};
			var options = this.tester.modules.options.get();

			params.type = this.$('#form-route-method').val();

			var url = new URI(this.$('#form-route-url').val());
			url.addQuery(this.getDataFromRegion('query', options.convert));
			if (options.debug) {
				url.addQuery('_debug', 'debug');
			}
			if (options.virtual) {
				url.addQuery('virtual_failure', '1');
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
			var errorElements = [];
			var allRequiredFieldsNotEmpty = _.all(['params', 'query', 'body'], function (name) {
				var $region = this.getRegionElement(name);

				var norm = true;
				$region.find('[name]').each(function () {
					var $el = $(this);
					if ($el.is('[required]')) {
						if ($el.is(':radio')) {
							norm = $region.find('[name="' + $el.attr('name') + '"]:checked').length;
						} else {
							norm = $el.val() != null ? Boolean($el.val().length) : false;

						}
					}
					$el.closest('.form-control-wr').removeClass('has-error');
					if (!norm) {
						errorElements.push($el);
					}
				});

				return norm;
			}, this);

			if (!options.ignoreRequired && !allRequiredFieldsNotEmpty && !customUrlParamsMode) {
				_.each(errorElements, function ($el) {
					$el.closest('.form-control-wr').addClass('has-error');
				});
				window.alert('Please fill the required fields!');
				return;
			}

			this.tester.save();

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