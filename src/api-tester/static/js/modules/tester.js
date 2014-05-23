define(function (require, exports, module) {
    "use strict";

	var _ = require('lodash');
	var $ = require('jquery');
	var Backbone = require('backbone');
	var utils = require('lib/utils');
	var random = require('lib/randomizr');
	var template = require('lib/templater');
	var jsonFormat = require('lib/json-format');
	var SpecCompiler = require('lib/form-generator');
	var URI = require('URIjs/URI');

	var formGen = new SpecCompiler({
		templates: {
			field:  template('gen/field'),
			text:   template('gen/text'),
			flag:   template('gen/flag'),
			cover:  template('gen/cover'),
			form:   template('gen/form'),
			custom: template('gen/cover')
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
					return Boolean(val);
				}
			},
			object: {
				template: 'cover'
			},
			array: {
				array:    true,
				template: 'cover'
			}
		}
	}, [
		{hello: {
			type:  'decimal',
			label: 'Hello:'
		}},
		{params: {
			type: 'array',
			nested: [
				{val: {
					type: 'string',
					label: 'hello',
					template: 'custom'
				}},
				{id: 'decimal'},
				{object: {
					type: 'object',
					nested: [
						{username: 'string'},
						{password: 'decimal'},
						{save: 'boolean'}
					]
				}}
			]
		}},
		{options: {
			type: 'object',
			nested: [
				{username11: 'string'},
				{password3: 'decimal'},
				{save: 'boolean'},
				{object2: {
					type: 'object',
					spec: [
						{username4: 'string'},
						{password5: 'decimal'},
						{save6: 'boolean'}
					]
				}}
			]
		}}
	]);

	var form = formGen.render('form', {
		hello: '111 hello!!!',
		params: [
			{
				val: 333,
				object: {
					username: 333444
				}
			},
			{
				val: 111,
				object: {
					username: 2222222
				}
			}
		],
		options: {
			username: 'victor!',
			object: {
				password: 112222333
			}
		}
	});

	$('#test').append(form);

	var vals = formGen.serialize($('#test'));
	var vals2 = formGen.serialize($('#test'), false);
	console.log(vals, vals2);

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
			if (this.spec.current.title !== this.spec.current.name) {
				this.$('#api-tester-spec-name').html(this.spec.current.title);
			}
			this.$('#api-tester-spec-ctrl').html(this.spec.current.controller);
			this.$('#api-tester-spec-action').html(this.spec.current.action);
			this.$('#api-tester-spec-description').html(this.spec.current.description || '');
		},

		refresh: function (href) {
			this.reset();

			href = href == null ? window.location.href : href;

			this.location = utils.parseUrl(href);
			this.location.data = this.location.data == null ? {} : this.location.data;

			this.spec.current = _.cloneDeep(this.spec.source[this.location.data.spec] || {});

			if (this.spec.current) {
				this.routes.current = this.routes.group[this.spec.current.name] || [];
			}

			if (_.isEmpty(this.routes.current)) {
				this.spec.current = {};
			}

			this.buildForm();
			this.initForm();
			this.initSpecHeader();

			this.delegateEvents();
		},

		$: function (find) {
			return find == null ? this.$el : this.$el.find(find);
		},

		delegateEvents: function () {
			var that = this;
			_.each(this.events, function (handler, event) {
				var name = event.replace(/^([^ ]+)[ ]+(.+)$/, '$1');
				var find = event.replace(/^([^ ]+)[ ]+(.+)$/, '$2');
				name = name + '.' ;

				_.each(allFormsUID, function (uid) {
					that.$().off(name + uid);
				});

				that.$().on(name + that.uid, find, function (e) {
					return that[handler].call(that, e, $(this));
				});
			});
		},

		initRawPanels: function () {
			var $rawsCheck = this.$('.panel-raw :checkbox');
			$rawsCheck.on('change', function () {
				var checked = $(this).is(':checked');
				var $raw = $(this).closest('.panel-raw');
				var $trBody = $raw.find('.panel-body.-transformed');
				var $rawBody = $raw.find('.panel-body.-raw');
				if (checked) {
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

			this.refreshRouterUrl();
		},

		_buildFormElement_field: function (element) {
			return tpl.form.field(_.extend(element, {
				label: element.name,
				placeholder: element.name,
				type: 'text'
			}));
		},

		_buildFormElement_string: function (element) {
			return this._buildFormElement_field.apply(this, arguments);
		},

		_buildFormElement_decimal: function (element) {
			return this._buildFormElement_field.apply(this, arguments);
		},

		_buildFormElement_integer: function (element) {
			return this._buildFormElement_field.apply(this, arguments);
		},

		_buildFormElement_float: function (element) {
			return this._buildFormElement_field.apply(this, arguments);
		},

		_buildFormElement_text: function (element) {
			return this._buildFormElement_field.apply(this, arguments);
		},

		_buildFormElement_boolean: function (element) {
			return tpl.form.toggle(_.extend(element, {
				label: element.name
			}));
		},

		_buildFormElement: function (element) {
			element = _.extend({
				name: null,
				type: null,
				value: null
			}, element);

			if (!this['_buildFormElement_' + element.type]) {
				console.error('must create _buildFormElement_' + element.type);
			}

			return this['_buildFormElement_' + element.type](element);
		},

		buildFormPart: function (partName, elementsArray) {
			var elements = _.map(elementsArray, this._buildFormElement, this);

			var elemId = '#api-tester-form-' + partName.toLowerCase();
			var $container = this.$(elemId + ' .panel-body-content');
			$container.html('');
			_.each(elements, function (html) {
				$container.append(html);
			});
		},

		buildForm: function () {
			if (_.isEmpty(this.spec.current)) {
				return;
			}

			_.each(['body', 'params', 'query'], function (part) {
				var req = _.isEmpty(this.spec.current.request) ? {} : this.spec.current.request;
				this.buildFormPart(part, (req.input || {})[part] || []);
			}, this);

			var counter = 0;

			var $formRouteSelect = $('#form-route');
			$formRouteSelect.html('');
			_.each(this.routes.current, function (v, k) {
				var $option = $('<option/>')
					.text(v.method + ' ' + v.reverse)
					.attr('value', counter++);
				$formRouteSelect.append($option);
			});
			$formRouteSelect.val(0);

//			var curr = nameMap[currName];
//
//			this.$("#mainHeader").html(curr);
//			var data = SPECS[nameMap[currName]];
//			var method = curr.replace(/([a-z]+)\s+(.+)/i, '$1');
//			var url = curr.replace(/([a-z]+)\s+(.+)/i, '$2');
//
//			var counter = 1;
//			url = url.replace(/\$[^\/]+/g, function($0){
//				if(/id/i.test($0)){
//					return counter++;
//				}
//				return $0;
//			});
//			$form.attr('action', API_ROOT + url + "/");
//			$form.attr('method', method);
//
//			if(data["request"]){
//				var setRandValue = function($elem, type, v, isValidData, isPrev, value){
//					if (!isPrev) {
//						if (/email/.test(v)) {
//							if(isValidData){
//								value = random.string(10) + '@' + window.randomString(5) + '.' + window.randomString(3);
//							} else {
//								value = random.string(10);
//							}
//						} else if (/decimal|float|integer/.test(type)) {
//							if (isValidData) {
//								value = random.integer(0, 1000);
//							} else {
//								value = random.string(10, false);
//							}
//						} else if (/text|string/.test(type)){
//							if (isValidData) {
//								value = random.string(10, true);
//							} else {
//								value = random.integer(0, 1000);
//							}
//						}
//					}
//					$elem.val(value);
//				};
//
//				this.$('.putData').on('click', function () {
//					var isValidData = that.$(this).hasClass('-valid');
//					var isPrevData = $(this).hasClass('-prev');
//					var prevData = window.loadSendDataToStore();
//					$.each(data['request'], function (k, v) {
//						if (!/^\$/.test(k)) {
//							var name = k.replace(/^([\w\d]+)\:?(.+)$/, '$1');
//							var type = k.replace(/^([\w\d]+)\:?(.+)$/, '$2');
//							var $elem = $form.find('[name="'+name+'"]');
//							if (/boolean/.test(type)) {
//								$elem.filter('[value="'+(random.boolean() * 1)+'"]').click();
//							} else {
//								if (_.isArray(v)) {
//									v = v.join('|');
//								}
//								if (isPrevData) {
//									var findName = false;
//									_.each(prevData, function(v){
//										if(v.name === name){
//											findName = true;
//											setRandValue($elem, type, v, isValidData, true, v.value);
//											return false;
//										}
//									});
//								} else {
//									setRandValue($elem, type, v, isValidData, false, '');
//								}
//							}
//						}
//					});
//				});
//
//				var formElement = '';
//				$.each(data['request'], function(k, v){
//					if(!/^\$/.test(k)){
//						var name = k.replace(/^([\w\d]+)\:?(.+)$/, '$1');
//						var type = k.replace(/^([\w\d]+)\:?(.+)$/, '$2');
//						if(/boolean/.test(type)){
//							formElement += tpl.form.cover({
//								type: type,
//								content: tpl.form.toggle({
//									label: name,
//									name: name
//								})
//							});
//						}else{
//							formElement += tpl.form.cover({
//								type: type,
//								content: tpl.form.field({
//									label: name,
//									placeholder: type,
//									type: 'text',
//									name: name
//								})
//							});
//						}
//					}
//				});
//				$formContent.html(formElement);
//				if(!formElement){
//					this.$('.putData').remove();
//				}
//			} else {
//				this.$('.putData').remove();
//			}
		},

		events: {
			//			'click #menu-bar li > a': 'onMenuItemClick',
			'keyup #api-tester-form-body input': 'sendOnEnter',
			'keyup #api-tester-form-params input': 'sendOnEnter',
			'keyup #api-tester-form-query input': 'sendOnEnter',
			'submit #api-tester-form': 'submitForm',
			'click #api-tester-form-submit': 'submitForm',
			'change #form-route': 'refreshRouterUrl',

			'keypress #api-tester-form-params [name]': 'refreshRouterUrl',
			'change #api-tester-form-params [name]': 'refreshRouterUrl'
		},

		getDataFromRegion: function (regionName) {
			var data = {};
			var $region = this.$('#api-tester-form-' + regionName + ' .panel-body-content');

			$region.find('[name]').each(function () {
				var name = $(this).attr('name');
				data[name] = $region.find('[name="' + name + '"]').val();
			});

			return data;
		},

		refreshRouterUrl: function () {
			var that = this;
			var routeId = this.$('#form-route').val();
			var route = this.routes.current[routeId];
			var data = this.getDataFromRegion('params');
			var url = this.reverseUrlByRoute(route, data);

			url = window.API_ROOT.replace(/\/$/, '') + '/' + url.replace(/^\//, '');

			this.$('#form-route-method').val(route.method);
			this.$('#form-route-url').val(url);
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
			return jsonFormat(obj);
		},

		sendOnEnter: function (e, $thisTarget) {
			if (e.keyCode === 13) {
				$thisTarget.closest("form").submit();
			}
		},

		showHeaders: function (contentSrc, content) {

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
				time: (Date.now() -requestObj.time)/1000,
				encoding: jqXHR.getResponseHeader('Content-Encoding'),
				compress_saved: (100 - Math.round((+jqXHR.getResponseHeader('Content-Length') / jqXHR.responseText.length)*100)) + '%'
			}));
		},

		onRequestSuccess: function (requestObj, response, jqXHR) {
			this.showHeaders(jqXHR.getAllResponseHeaders());
			this.showErrors();
			this.showResponse(jqXHR.responseText, response);
			this.showInfo(requestObj, response, jqXHR);
		},

		onRequestError: function (requestObj, response, jqXHR) {
			var responseSrc = response;

			try {
				response = JSON.parse(response, true);
			} catch (e) {
				response = responseSrc;
			}

			this.showHeaders(jqXHR.getAllResponseHeaders());
			this.showInfo(requestObj, response, jqXHR);
			this.showResponse(jqXHR.responseText, response);

			this.showErrors('<div class="alert alert-danger"><h4>Error <b>' + jqXHR.status + '</b> (<i>' + status + '</i>)</h4><p>' + jqXHR.statusText + '</p></div>');
		},

		saveRequestParamsToUrl: function () {
			var params = {
				method: this.$('#form-route-method').val(),
				uri: this.$('#form-route-url').val(),
				route: this.$('#form-route').val(),
				additionalQuery: this.$('#form-request-query').val(),
				values: {
					query: this.getDataFromRegion('query'),
					body: this.getDataFromRegion('body'),
					params: this.getDataFromRegion('params')
				},
				form: {
					// need add current form structure
				},
				format: {
					request: $('#form-request-format').val(),
					response: $('#form-response-format').val()
				}
			};
			this.router.replaceParam('params', JSON.stringify(params));
		},

		submitForm: function () {
			var that = this;

			var requestObj = {
				time: Date.now()
			};

			var params = {};

			params.type = this.$('#form-route-method').val();

			params.url = this.$('#form-route-url').val();
			params.url = utils.addParamsToUrl(params.url, this.getDataFromRegion('query'));
			params.url = params.url + '?' + this.$('#form-request-query').val();

			params.dataType = $('#form-response-format').val();

			var data = this.getDataFromRegion('body');

			if (params.type !== "GET") {
				params.contentType = $('#form-request-format').val();
				params.data = JSON.stringify(data);
			}

			this.saveRequestParamsToUrl();

			this.showRequestData(params.data, data);

			$.ajax($.extend({}, params, {
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