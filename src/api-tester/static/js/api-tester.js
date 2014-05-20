define(function (require, exports, module) {
    "use strict";

	var _ = require('lodash');
	var $ = require('jquery');
	var utils = require('modules/utils');
	var random = require('modules/randomizr');
	var template = require('modules/templater');
	var jsonFormat = require('modules/json-format');

	var tpl = {
		panel: template('panel'),
		form: {
			field: template('form/field'),
			textarea: template('form/text'),
			cover: template('form/cover'),
			toggle: template('form/toggle'),
			select: template('form/select')
		}
	};

	var allFormsUID = [];

	function Form (container, spec, routes) {
		var that = this;

		this.uid = 'apiTesterForm' + allFormsUID.length;
		allFormsUID.push(this.uid);

		this._spec = spec;
		this._routes = routes;

		this.spec = {};
		this.routes = {};

		this.$el = $(container).eq(0);
		this.el = this.$el.get()[0];

		this.reset();

		that.refresh();
	}

	Form.prototype = {

		reset: function () {
			this.spec.current = {};
			this.spec.source = _.cloneDeep(this._spec);
			this.location = null;
			this.element = {};
			this.routes.source = _.cloneDeep(this._routes);
			this.routes.group = _.groupBy(this.routes.source, 'name');
			this.routes.current = [];
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

			this.initMenu();
			this.buildForm();
			this.initForm();

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

		initMenu: function () {
			var that = this;
			var $menu = $("#api-tester-nav");
			$(function () {
				$menu.find('li').removeClass('active');
				if (that.spec.current) {
					$menu.find('[data-ctrl="' + that.spec.current.controller + '"]').addClass('in');
					$menu.find('[data-spec="' + that.spec.current.name + '"]').addClass('active');
				}
			});
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

		buildForm: function () {
			if (_.isEmpty(this.spec.current)) {
				return;
			}

			_.each(this.spec.current.request.input, function (input, category) {
				if (_.isEmpty(input)) {
					return;
				}

				var elemName = 'requestInputForm_' + category;
				this.build(elemName, tpl.panel, {
					label: category.toUpperCase(),
					type: '',
					content: ''
				}, '#form-content');

				_.each(input, function (itemOptions, itemName) {

					if (/boolean/.test(itemOptions.type)) {
						this.build(elemName + ' ' + itemName, tpl.form.toggle, {
							label: itemName,
							name: itemName
						}, this.element[elemName]);
					} else {
						this.build(elemName + ' ' + itemName, tpl.form.field, {
							label: itemName,
							placeholder: itemName,
							type: 'text',
							name: itemName
						}, this.element[elemName]);
					}

				}, this);

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
			'keyup #requestInputForm_body input': 'sendOnEnter',
			'submit #form': 'submitForm',
			'change #form-route': 'refreshRouterUrl',
			'keypress #requestInputForm_params [name]': 'refreshRouterUrl',
			'change #requestInputForm_params [name]': 'refreshRouterUrl'
		},

		getDataFromRegion: function (regionName) {
			var that = this;
			var data = {};
			var $region = this.$('#requestInputForm_' + regionName);

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

		//		onMenuItemClick: function (e, $thisTarget) {
		//			window.location.href = $thisTarget.attr("href");
		//			window.location.reload();
		//			return false;
		//		},

		sendOnEnter: function (e, $thisTarget) {
			if (e.keyCode === 13) {
				$thisTarget.closest("form").submit();
			}
		},

		onRequestSuccess: function (requestObj, response, jqXHR) {
			this.$("#response").html("");
			this.$("#responseHeadersNonFormat").html(jqXHR.getAllResponseHeaders());
			this.$("#errors").html("");
			if($.isPlainObject(response)){
				this.$("#response").html(jsonFormat(response));
			}else{
				this.$("#response").text(response);
			}
			//			this.$('#sendInfo').html(jsonFormat({
			//				time: (Date.now() - time)/1000,
			//				encoding: jqXHR.getResponseHeader('Content-Encoding'),
			//				compress: (100 - Math.round((+jqXHR.getResponseHeader('Content-Length') / jqXHR.responseText.length)*100)) + '%'
			//			}));
		},

		onRequestError: function (requestObj, jqXHR) {
			var resp = jqXHR.responseText,
				isJSON = false;

			var respHtml = jqXHR.responseText.replace(/[<]!DOCTYPE(?:[^>]*)[>]/g, '');
			respHtml = respHtml.replace(/<\/?html[^>]+>/g, '');

			this.$("#responseHeadersNonFormat").html(jqXHR.getAllResponseHeaders());

			try {
				resp = jsonFormat(JSON.parse(jqXHR.responseText, true));
				isJSON = true;
			} catch (e) {
				resp = respHtml;
				isJSON = false;
			}

			this.$("#response").html(isJSON ? resp : "");
			this.$("#errors").html(
				'<div class="alert alert-danger">' +
					'<h4>Ajax Error <b>' + jqXHR.status + '</b> (<i>' + status + '</i>)</h4>' +
					'<p>' + jqXHR.statusText + '</p><br>' +
					(isJSON ? '' : '<div>' + resp + '</div>') +
					'</div>'
			);
			this.$("#response").text(jqXHR.responseText);
			this.$('#sendInfo').html(jsonFormat({
				//				time: (Date.now() - time)/1000
			}));
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

			console.log(params.url);

			params.dataType = 'json';

			if(params.type !== "GET"){
				params.contentType = 'json';
				params.data = JSON.stringify(this.getDataFromRegion('body'));
			}

			$.ajax($.extend({}, params, {
				success: function(response, _$, jqXHR){
					that.onRequestSuccess(requestObj, response, jqXHR);
				},
				error: function(jqXHR, status){
					that.onRequestError(requestObj, jqXHR);
				}
			}));

			return false;
		}
	};

	$(function () {
		var form = new Form($('#api-tester'), window.API_JSON, window.API_ROUTES_JSON);
	});

	//	$(function(){
	//
	//		var $form = $("#form");
	//		var $formContent = $('#form-content');
	//		var currName = null;
	//		var currMethod = null;
	//		var currLocation = (window.location.href + "").replace(/^[^\#]+\#?(.*)$/, "$1");
	//
	//		// BUILD FORM
	//		if(SPECS[nameMap[currName]]){
	//
	//			var $method = $('#_METHOD_'),
	//				$format = $("#_FORMAT_"),
	//				$url = $('#_URL_');
	//
	//			$method.val(($form.attr("method") || "").toUpperCase() || "GET");
	//			$url.val(($form.attr("action") || "") || "/");
	//
	//			$form.on("submit", function(){
	//
	//			});
	//		}
	//	});


    return function () {

	};
});