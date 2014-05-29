define(function (require, exports, module) {
    "use strict";

	var _ = require('lodash');
	var $ = require('jquery');
	var Backbone = require('backbone');
	var utils = require('lib/utils');
	var random = require('lib/randomizr');
	var template = require('lib/templater');
	var jsonFormat = require('lib/json-format');
	var SpecCompiler = require('lib/form-generator/form-generator');
	var URI = require('URIjs/URI');

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

	var tpl = {
		form: {
			field: template('form/field'),
			textarea: template('form/text'),
			toggle: template('form/toggle'),
			select: template('form/select')
		}
	};

	var allFormsUID = [];

	function SpecFormApp (router, container, spec, routes) {
		this.router = router;

		this.uid = 'apiTesterForm' + allFormsUID.length;
		allFormsUID.push(this.uid);

		this._spec = spec;
		this._routes = routes;

		this.spec = {};
		this.routes = {};

		this.$el = $(container).eq(0);
		this.el = this.$el.get()[0];

		this.initRawPanels();
		this.reset();

		this.refresh();
	}

	SpecFormApp.prototype = {

		reset: function () {
			this.spec.current = {};
			this.spec.source = _.cloneDeep(this._spec);
			this.location = null;
			this.element = {};
			this.routes.source = _.cloneDeep(this._routes);
			this.routes.group = _.groupBy(this.routes.source, 'name');
			this.routes.current = [];
		},

		initSpecHeader: function () {
			this.$('#api-tester-spec-name').val(this.spec.current.name);
			this.$('#api-tester-spec-reset').attr('href', this.getSpecUrl(this.spec.current.name));
			this.$('#api-tester-spec-ctrl').html(this.spec.current.controller);
			this.$('#api-tester-spec-action').html(this.spec.current.action);
			this.$('#api-tester-spec-description').html(this.spec.current.description || '');
		},

		refresh: function (href) {
			this.reset();

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

			this.delegateEvents();
		},

		showResponseDebugInfo: function (responseJSON) {
			var debug = responseJSON.debug;
			if (this.getOptions().debugInfo) {
				delete responseJSON.debug;
			}
			if (_.isEmpty(debug)) {
				return;
			}
			this.debug_drawTimers(debug);
			this.debug_drawMemory(debug);
			this.debug_drawDb(debug);
			this.debug_drawHeaders(debug);
			this.debug_drawStackTrace(debug);
		},

		debug_drawTimers: function (responseDebug) {
			this.$('#api-tester-debug-info-timers .panel-body').html(this.formatJSON(responseDebug.timers));
		},

		debug_drawMemory: function (responseDebug) {
			this.$('#api-tester-debug-info-memory .panel-body').html(this.formatJSON(responseDebug.memory));
		},

		debug_drawDb: function (responseDebug) {
			this.$('#api-tester-debug-info-db .panel-body').html(this.formatJSON(responseDebug.db));
		},

		debug_drawHeaders: function (responseDebug) {
			if (!responseDebug.input || !responseDebug.input.headers) {
				return;
			}
			this.$('#api-tester-debug-info-headers .panel-body').html(this.formatJSON(responseDebug.input.headers.raw));
		},

		debug_drawStackTrace: function (responseDebug) {
			if (!responseDebug.stackTrace || !responseDebug.stackTrace.length) {
				return;
			}
			this.$('#api-tester-debug-info-log .panel-body').html(this.formatJSON(responseDebug.stackTrace));
		},

		clearResponseDebugInfo: function () {
			this.$('#api-tester-debug-info-timers .panel-body').html('');
			this.$('#api-tester-debug-info-memory .panel-body').html('');
			this.$('#api-tester-debug-info-info-db .panel-body').html('');
			this.$('#api-tester-debug-info-headers .panel-body').html('');
			this.$('#api-tester-debug-info-info-log .panel-body').html('');
		},

		$: function (find) {
			return find == null ? this.$el : this.$el.find(find);
		},

		delegateEvents: function () {
			var that = this;
			_.each(this.events, function (handler, event) {
				var find = event.replace(/^([^ ]+)[ ]+(.+)$/, '$2');
				var name = event.replace(/^([^ ]+)[ ]+(.+)$/, '$1') + '.' + find.replace(/[^a-zA-Z0-9_]/g,'_');

				_.each(allFormsUID, function (uid) {
					that.$().off(name + uid);
				});

				that.$().on(name + that.uid, find, function (e) {
					return that[handler].call(that, e, $(this));
				});
			});
		},

		initRawPanels: function () {
			this.$().on('change', '.panel-raw-toggle :checkbox', function () {
				var checked = $(this).is(':checked');
				var $raw = $(this).closest('.panel-raw');
				var $trBody = $raw.find('.panel-body.-transformed');
				var $rawBody = $raw.find('.panel-body.-raw');
				if (!checked) {
					$trBody.hide();
					$rawBody.show();
				} else {
					$trBody.show();
					$rawBody.hide();
				}
			});
		},

		insertToRawPanel: function (name, raw, transformed) {
			raw = (raw == null ? '' : raw) + '';
			var $panel = this.$('#api-tester-'+name);
			$panel.find('.panel-body.-transformed').html(transformed);
			$panel.find('.panel-body.-raw').html(raw).attr('title', '  length: ' + raw.length + 'symbols  ');
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
				var $element = this.getRegionElement(part);
				var formGen = new SpecCompiler(stdFormGeneratorOptions);
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
			//			'click #menu-bar li > a': 'onMenuItemClick',
			'keyup     #api-tester-form-body input':     'sendOnEnter',
			'click     .json-f-smpl': 'jsonFormatToggleValue',
			'click     .json-f-key.json-f-v-it': 'jsonFormatToggleObject',
			'keyup     #api-tester-form-params input':   'sendOnEnter',
			'keyup     #api-tester-form-query input':    'sendOnEnter',
			'submit    #api-tester-form':                'submitForm',
			'click     #api-tester-form-submit':         'submitForm',
			'change    #form-route':                     'refreshRouterUrl',
			'change    #api-tester-spec-name':           'changeSpecName',

			'keyup     #api-tester-form-params [name]':  'refreshRouterUrl',
			'change    #api-tester-form-params [name]':  'refreshRouterUrl'
		},

		jsonFormatToggleValue: function (_1, $el) {
			$el.toggleClass('-json-f-norm');
		},

		jsonFormatToggleObject: function (_1, $el) {
			$el.toggleClass('-json-f-closed');
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

		getDataFromRegion: function (regionName, bySpec) {
			var data = {};
			var $region = this.getRegionElement(regionName);

			var formGen = $region.data('formGen');

			data = formGen.serialize($region, bySpec == null ? true : bySpec);
			return data;
		},

		getRegionElement: function (regionName) {
			return this.$('#api-tester-form-' + regionName.toLowerCase() + ' .panel-body-content');
		},

		refreshRouterUrl: function () {
			var params = this.loadRequestParamsFromUrl();

			var routeId = this.$('#form-route').val();
			var route = this.routes.current[routeId] || {};

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

		formatJSON: function (obj, options) {
			return jsonFormat(obj, _.extend({
				unindent: true,
				stringQuotes: false,
				lastComma: false,
				unwrapFirstBrace: true
			}, options));
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
			this.insertToRawPanel('response-headers', contentSrc, this.formatJSON(headers));
		},

		showErrors: function (string) {
			this.$("#errors").html(string || '');
		},

		showResponse: function (contentSrc, content) {
			content || (content = contentSrc);
			if($.isPlainObject(content)){
				content =  this.formatJSON(content);
			}
			this.insertToRawPanel('response-data', contentSrc, content);
		},

		showRequestData: function (srcData, data) {
			data || (data = srcData);
			if($.isPlainObject(data)){
				data =  this.formatJSON(data);
			}
			this.insertToRawPanel('request-data', srcData, data);
		},

		showInfo: function (requestObj, response, jqXHR) {
			this.$('#api-tester-interaction-info .panel-body').html( this.formatJSON({
				jq_time: (Date.now() -requestObj.time)/1000,
				url: requestObj.params.url,
				method: requestObj.params.type,
				contentType: requestObj.params.contentType,
				dataType: requestObj.params.dataType,
				encoding: jqXHR.getResponseHeader('Content-Encoding'),
				compress_saved: (100 - Math.round((+jqXHR.getResponseHeader('Content-Length') / jqXHR.responseText.length)*100)) + '%'
			}));
		},

		onRequestSuccess: function (requestObj, response, jqXHR) {
			this.showErrors();
			this.showResponseDebugInfo(response);
			this.showInfo(requestObj, response, jqXHR);
			this.showResponse(jqXHR.responseText, response);
			this.showHeaders(jqXHR);
		},

		onRequestError: function (requestObj, response, jqXHR) {
			var responseSrc = response;

			try {
				response = JSON.parse(response, true);
				this.showResponseDebugInfo(response);
			} catch (e) {
				response = responseSrc;
			}

			this.showInfo(requestObj, response, jqXHR);
			this.showResponse(jqXHR.responseText, response);
			this.showHeaders(jqXHR);

			this.showErrors('<div class="alert alert-danger">Error <b>' + jqXHR.status + '</b> <em>( ' + jqXHR.statusText + ' )</em></div>');

		},

		saveRequestParamsToUrl: function () {
			var params = {
				method: this.$('#form-route-method').val(),
				uri: this.$('#form-route-url').val(),
				route: this.$('#form-route').val(),
				values: {
					query: this.getDataFromRegion('query'),
					body: this.getDataFromRegion('body'),
					params: this.getDataFromRegion('params')
				},
				spec: {
					query: this.getRegionElement('query').data('spec'),
					body: this.getRegionElement('body').data('spec'),
					params: this.getRegionElement('params').data('spec')
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
			var result = {};

			if (query.params) {
				result = JSON.parse(query.params);
			}

			return result;
		},

		submitForm: function () {
			var that = this;

			var requestObj = {
				time: Date.now()
			};

			var params = {};
			var options = this.getOptions();

			params.type = this.$('#form-route-method').val();

			params.url = this.$('#form-route-url').val();
			params.url = utils.addParamsToUrl(params.url, this.getDataFromRegion('query', options.convert));

			if (options.debug) {
				params.url = utils.addParamsToUrl(params.url, {
					_debug: 'debug'
				});
			}

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

			this.saveRequestParamsToUrl();

			this.showRequestData(params.data, data);

			this.clearResponseDebugInfo();
			$.ajax(_.extend(params, {
				success: function (response, _$, jqXHR) {
					that.onRequestSuccess(requestObj, response, jqXHR);
				},
				error: function (jqXHR, status) {
					that.onRequestError(requestObj, jqXHR.responseText, jqXHR);
				}
			}));

			return false;
		}
	};

	var SpecRouter = Backbone.Router.extend({

		routes: {
			"help":                 "help",    // #help
			"search/:query":        "search",  // #search/kiwis
			"search/:query/p:page": "search"   // #search/kiwis/p7
		},

		initialize: function () {
			var r = SpecRouter.__super__.initialize.apply(this, arguments);

			this.form = new SpecFormApp(this, $('#api-tester'), window.API_JSON, window.API_ROUTES_JSON);

			return r;
		},

		addParam: function (name, value) {
			var uri = URI(window.location.href);
			uri.addQuery(name, value);
			this.navigate(this._urlStringToNavigate(uri), {trigger: true});
		},

		removeParam: function (name) {
			var uri = URI(window.location.href);
			uri.removeQuery(name);
			this.navigate(this._urlStringToNavigate(uri), {trigger: true});
		},

		replaceParam: function (name, value) {
			var uri = URI(window.location.href);
			uri.removeQuery(name);
			uri.addQuery(name, value);
			this.navigate(this._urlStringToNavigate(uri), {trigger: true});
		},

		_urlStringToNavigate: function (uri) {
			return uri.path() + '?' + uri.query();
		}

	});


    return function () {

		var router = new SpecRouter();

		Backbone.history.start({
			pushState: true
		});
	};
});