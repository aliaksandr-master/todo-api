define(function (require, exports, module) {
    "use strict";

	var _ = require('lodash');
	var $ = require('jquery');
	var utils = require('lib/utils');
	var random = require('lib/randomizr');
	var URI = require('URIjs/URI');

	var TesterDebug = require('modules/tester/debug/tester-debug');
	var TesterOptions = require('modules/tester/options/tester-options');
	var TesterRequest = require('modules/tester/request/tester-request');
	var TesterRequestData = require('modules/tester/request-data/tester-request-data');
	var TesterResponse = require('modules/tester/response/tester-response');
	var TesterSpec = require('modules/tester/spec/tester-spec');
	var TesterForm = require('modules/tester/form/tester-form');

	var FormatJSON = require('modules/tester/utils/json-format');
	var Panel = require('modules/tester/utils/panel');

	var allFormsUID = [];

	var BaseComponent = require('modules/tester/base/tester-component');

	var Tester = BaseComponent.extend('Tester', {

		initialize: function (router, container, spec, routes) {
			this.tester = this;

			this.router = router;

			this.uid = 'apiTesterForm' + allFormsUID.length;
			allFormsUID.push(this.uid);

			this._spec = spec;
			this._routes = routes;

			this.spec = {};
			this.routes = {};

			this.$el = $(container).eq(0);
			this.el = this.$el.get()[0];

			this.modules = {
				debug: new TesterDebug(this),
				options: new TesterOptions(this),
				request: new TesterRequest(this),
				requestData: new TesterRequestData(this),
				response: new TesterResponse(this),
				form: new TesterForm(this),
				panel: new Panel(this),
				json: new FormatJSON(this),
				spec: new TesterSpec(this)
			};

			this.initEvents();
			this.refresh();
		},

		init: function () {
			this.spec.current = {};
			this.spec.source = _.cloneDeep(this._spec);
			this.location = null;
			this.element = {};
			this.routes.source = _.cloneDeep(this._routes);
			this.routes.group = _.groupBy(this.routes.source, 'name');
			this.routes.current = [];

			_.each(this.modules, function (module) {
				module.init();
			});
		},

		refresh: function (href) {
			this.init();

			href = href == null ? window.location.href : href;

			this.location = URI(href);

			this.spec.current = _.cloneDeep(this.spec.source[this.location.query(true).spec] || {});

			if (this.spec.current) {
				this.routes.current = this.routes.group[this.spec.current.name] || [];
			}

			if (_.isEmpty(this.routes.current)) {
				this.spec.current = {};
			}

			this.buildForm();
			this.initForm();
			this.initSpecHeader();
			this.initOptions();

			_.each(this.modules, function (module) {
				module.refresh();
			});
		},

		initSpecHeader: function () {
			this.$('#api-tester-spec-name').val(this.spec.current.name);
			this.$('#api-tester-spec-reset').attr('href', this.getSpecUrl(this.spec.current.name));
			this.$('#api-tester-spec-ctrl').html(this.spec.current.controller);
			this.$('#api-tester-spec-action').html(this.spec.current.action);
			this.$('#api-tester-spec-description').html(this.spec.current.description || '');
		},

		build: function (id, builder, options, $place, method) {
			method = method || 'append';
			options.id = id.replace(/^[#]+/, '');
			this.$($place)[method](builder(options));
			this.element[options.id] = this.$('#' + options.id);
			return this;
		},

		_parseCamelCase: function (str) {
			return str.replace(/Controller$/i, '').replace(/([A-Z])/g, ' $1').trim().toLowerCase();
		},

		initForm: function () {
			this.refreshFormats();
			this.refreshRouterUrl();
		},

		refreshFormats: function () {
			var params = this.loadRequestParamsFromUrl();

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
					type: v.type
				};
			}), values);
		},

		initOptions: function () {
			var params = this.loadRequestParamsFromUrl();
			if (!_.isEmpty(params.options)) {
				this.$('#api-tester-options-wr [name="option-debug"]').attr('checked', params.options.debug);
				this.$('#api-tester-options-wr [name="option-convert"]').attr('checked', params.options.convert);
				this.$('#api-tester-options-wr [name="option-debug-info"]').attr('checked', params.options.debugInfo);
			}
		},

		saveToHistory: function (href, params) {
			if (this.history == null) {
				this.history = {};
			}
			if (this.history[href] != null) {
				return;
			}

			this.history[href] = true;

			var date = new Date();
			var time = date.getHours() + ':' + date.getMinutes();
			var $a = $('<a/>').attr('href', href).html('');
			this.$('#api-tester-history .panel-body').append(
				'<div class="api-tester-history-item">' +
					'<a href="' + href + '">' + '<span class="label label-success">' + params.method + '</span> ' + params.uri + ' <b>(' + time + ')</b>' +'</a>' +
				'</div>'
			);
		},

		getOptions: function () {
			var debug = this.$('#api-tester-options-wr [name="option-debug"]:checked').length;
			var convert = this.$('#api-tester-options-wr [name="option-convert"]:checked').length;
			var debugInfo = this.$('#api-tester-options-wr [name="option-debug-info"]:checked').length;
			return {
				debugInfo: Boolean(debugInfo),
				debug: Boolean(debug),
				convert: Boolean(convert)
			};
		},

		buildForm: function () {
			if (_.isEmpty(this.spec.current)) {
				return;
			}

			var params = this.loadRequestParamsFromUrl();
			_.each(['body', 'params', 'query'], function (part) {
				var req = _.isEmpty(this.spec.current.request) ? {} : this.spec.current.request;
				var $element = this.modules.form.getRegionElement(part);
				var formGen = this.modules.form.createFormGen();
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
			_.each(this.routes.current, function (v) {
				$formRouteSelect.append($('<option/>').text(v.method + ' ' + v.reverse).attr('value', counter++));
			});
			$formRouteSelect.append($('<option/>').text('custom').attr('value', -1));
			$formRouteSelect.val(params.route || (counter ? 0 : -1));

		},

		events: {
			'change    #form-route':                     'refreshRouterUrl',
			'change    #api-tester-spec-name':           'changeSpecName',

			'keyup     #api-tester-form-params [name]':  'refreshRouterUrl',
			'change    #api-tester-form-params [name]':  'refreshRouterUrl'
		},

		getSpecUrl: function (specName) {
			specName = specName || this.spec.current.name;
			var curUrl = URI(this.location.path());
			curUrl.addQuery('spec', specName);
			return curUrl.toString();
		},

		changeSpecName: function () {
			var specName = this.$('#api-tester-spec-name').val();
			window.location.href = this.getSpecUrl(specName);
		},

		refreshRouterUrl: function () {
			var params = this.loadRequestParamsFromUrl();

			var routeId = this.$('#form-route').val();
			var route = this.routes.current[routeId] || {};

			var root = window.API_ROOT.replace(/\/$/, '') + '/';

			var url = this.$('#form-route-url').val() || root;
			var method = this.$('#form-route-method').val() || 'GET';

			if (!_.isEmpty(route)) {
				var data = this.modules.form.getDataFromRegion('params', false);
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

		sendOnEnter: function (e, $thisTarget) {
			if (e.keyCode === 13) {
				$thisTarget.closest("form").submit();
			}
		},

		showHeaders: function (xhr, content) {
			var contentSrc = xhr.getAllResponseHeaders();
			var headers = {};
			contentSrc.replace(/^(.*?):[ \t]*([^\r\n]*)$/mg, function (w, name, value) {
				headers[name] = value;
			});
			this.modules.panel.insertToRaw('response-headers', contentSrc, this.modules.json.format(headers));
		},

		showErrors: function (string) {
			this.$("#errors").html(string || '');
		},

		showResponse: function (contentSrc, content) {
			content || (content = contentSrc);
			if($.isPlainObject(content)){
				content =  this.modules.json.format(content);
			}
			this.modules.panel.insertToRaw('response-data', contentSrc, content);
		},

		showRequestData: function (srcData, data) {
			data || (data = srcData);
			if($.isPlainObject(data)){
				data =  this.modules.json.format(data);
			}
			this.modules.panel.insertToRaw('request-data', srcData, data);
		},

		showInfo: function (requestObj, response, jqXHR) {
			this.$('#api-tester-interaction-info .panel-body').html( this.modules.json.format({
				jq_time: (Date.now() -requestObj.time)/1000,
				url: requestObj.params.url,
				method: requestObj.params.type,
				contentType: requestObj.params.contentType,
				dataType: requestObj.params.dataType,
				encoding: jqXHR.getResponseHeader('Content-Encoding'),
				compress_saved: (100 - Math.round((+jqXHR.getResponseHeader('Content-Length') / jqXHR.responseText.length)*100)) + '%'
			}));
		},

		saveRequestParamsToUrl: function () {
			var params = {
				method: this.$('#form-route-method').val(),
				uri: this.$('#form-route-url').val(),
				route: this.$('#form-route').val(),
				values: {
					query: this.modules.form.getDataFromRegion('query'),
					body: this.modules.form.getDataFromRegion('body'),
					params: this.modules.form.getDataFromRegion('params')
				},
				spec: {
					query: this.modules.form.getRegionElement('query').data('spec'),
					body: this.modules.form.getRegionElement('body').data('spec'),
					params: this.modules.form.getRegionElement('params').data('spec')
					// need add current form structure
				},
				format: {
					request: $('#form-request-format').val(),
					response: $('#form-response-format').val()
				},
				options: this.getOptions()
			};
			this.router.replaceParam('params', JSON.stringify(params));

			this.saveToHistory(window.location.href, params);
		},

		loadRequestParamsFromUrl: function () {
			var query = this.location.query(true);
			return query.params ? JSON.parse(query.params) : {};
		}
	});

    return Tester;
});