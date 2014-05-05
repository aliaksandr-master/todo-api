"use strict";

(function(window, $, _, template){

	var SPECS = window.specs();

	var tpl = {
		panel: template('panel'),
		main: template('main'),
		menu: template('menu'),
		form: {
			field: template('form-field'),
			textarea: template('form-text'),
			cover: template('form-cover'),
			toggle: template('form-toggle'),
			select: template('form-select')
		}
	};

	var allFormsUID = [];

	function Form (specs) {
		var that = this;

		this.specs = {
			source: specs,
			parsed: {}
		};
		this.uid = 'apiTesterForm' + allFormsUID.length;

		allFormsUID.push(this.uid);

		$(function () {
			$(document.body).html(tpl.main());
			that.buildPlaces();

			that.buildMenu();
			that.initLocation();
//			that.buildForm();
//
			that._delegateEvents();
			that.applyDataFromLocation();
		});
	}

	Form.prototype = {

		_delegateEvents: function () {
			var that = this;
			_.each(this.events, function (handler, event) {
				var name = event.replace(/^([^ ]+)[ ]+(.+)$/, '$1');
				var find = event.replace(/^([^ ]+)[ ]+(.+)$/, '$2');
				name = name + '.' ;

				_.each(allFormsUID, function (uid) {
					$(document).off(name + uid);
				});

				$(document).on(name + that.uid, find, function (e) {
					return that[handler].call(that, e, $(this));
				});
			});
		},

		applyDataFromLocation: function () {
			var parsedUrl = window.utils.parseUrl(window.location.href);
			var $menu = $("#menu-bar");

			this.specName = parsedUrl.data.spec;

			// MENU
			$menu.find('.menu-nav-li').removeClass('active');
			if (this.specName) {
				$menu.find('[data-ctrl="' + this.getCtrlNameBySpecName(this.specName) + '"]').addClass('in');
				$menu.find('[data-spec="' + this.specName + '"]').addClass('active');
			}

		},

		getCtrlNameBySpecName: function (specName) {
			return specName.replace(/^([^\.]+)\..+$/, '$1');
		},

		initLocation: function () {
			var parsedUrl = window.utils.parseUrl(window.location.href);
			console.log(parsedUrl);
		},

		build: function (id, builder, options, $place, method) {
			method = method || 'append';
			options.id = id.replace('#', '');
			$($place)[method](builder(options));
			this[options.id] = $('#' + options.id);
			return this;
		},

		buildPlaces: function(){

			var $responsePanels = $('#response-panels');
			var $requestPanels  = $('#request-bar');

			this
				.build('#responseJSON', tpl.panel, {
					label: "Respoonse <b>API</b>",
					type: 'success',
					content: ''
				}, $responsePanels)

				.build('#responseHTML', tpl.panel, {
					label: "Respoonse <b>HTML</b>",
					type: 'default',
					content: ''
				}, $responsePanels)

				.build('#sendInfo', tpl.panel, {
					label: "<b>Info</b>",
					type: 'default',
					content: ''
				}, $requestPanels)

				.build('#requestParams', tpl.panel, {
					label: "Request <b>Data</b> (formatted)",
					type: 'info',
					content: ''
				}, $requestPanels)

				.build('#responseHeadersNonFormat', tpl.panel, {
					label: "Response <b>Headers</b>",
					type: 'success',
					content: ''
				}, $requestPanels)

				.build('#requestDataNonFormat', tpl.panel, {
					label: "Request <b>Data</b>",
					type: 'default',
					content: ''
				}, $requestPanels)

				.build('#response', tpl.panel, {
					label: "Response <b>Data</b>",
					type: 'default',
					content: ''
				}, $requestPanels);
		},

		buildMenu: function () {

			var that = this;
			var parsedUrl = window.utils.parseUrl(window.location.href);

			var ctrl = {};
			_.each(this.specs.source, function (spec) {
				var ctrlName = spec.controller.replace(/Controller$/i, '').replace(/([A-Z])/g, ' $1').trim().toLowerCase();
				if (!ctrl[ctrlName]) {
					ctrl[ctrlName] = [];
					ctrl[ctrlName].ctrl = spec.controller;
				}
				ctrl[ctrlName].push({
					name: spec.name,
					text: spec.action,
					link: window.utils.addParamsToUrl(parsedUrl.path, {
						spec: spec.name
					})
				});
			});

			var counter = 0;
			var data = _.map(ctrl, function (v, k) {
				return {
					index: counter++,
					name: k,
					ctrl: v.ctrl,
					links: v
				};
			});


			var $menu = $("#menu-bar");
			$menu.append(tpl.menu({
				data: data
			}));
			$("#accordion").collapse();
		},

		buildForm: function () {
			var curr = nameMap[currName];

			$("#mainHeader").html(curr);
			var data = SPECS[nameMap[currName]];
			var method = curr.replace(/([a-z]+)\s+(.+)/i, '$1');
			var url = curr.replace(/([a-z]+)\s+(.+)/i, '$2');

			var counter = 1;
			url = url.replace(/\$[^\/]+/g, function($0){
				if(/id/i.test($0)){
					return counter++;
				}
				return $0;
			});
			$form.attr('action', window.API_ROOT + url + "/");
			$form.attr('method', method);

			if(data["request"]){
				var setRandValue = function($elem, type, v, isValidData, isPrev, value){
					if (!isPrev) {
						if (/email/.test(v)) {
							if(isValidData){
								value = window.randomString(10) + '@' + window.randomString(5) + '.' + window.randomString(3);
							} else {
								value = window.randomString(10);
							}
						} else if (/decimal|float|integer/.test(type)) {
							if (isValidData) {
								value = window.randomInteger(0, 1000);
							} else {
								value = window.randomString(10, false);
							}
						} else if (/text|string/.test(type)){
							if (isValidData) {
								value = window.randomString(10, true);
							} else {
								value = window.randomInteger(0, 1000);
							}
						}
					}
					$elem.val(value);
				};

				$('.putData').on('click', function () {
					var isValidData = $(this).hasClass('-valid');
					var isPrevData = $(this).hasClass('-prev');
					var prevData = window.loadSendDataToStore();
					$.each(data['request'], function (k, v) {
						if (!/^\$/.test(k)) {
							var name = k.replace(/^([\w\d]+)\:?(.+)$/, '$1');
							var type = k.replace(/^([\w\d]+)\:?(.+)$/, '$2');
							var $elem = $form.find('[name="'+name+'"]');
							if (/boolean/.test(type)) {
								$elem.filter('[value="'+(window.randomBoolean() * 1)+'"]').click();
							} else {
								if (_.isArray(v)) {
									v = v.join('|');
								}
								if (isPrevData) {
									var findName = false;
									_.each(prevData, function(v){
										if(v.name === name){
											findName = true;
											setRandValue($elem, type, v, isValidData, true, v.value);
											return false;
										}
									});
								} else {
									setRandValue($elem, type, v, isValidData, false, '');
								}
							}
						}
					});
				});

				var formElement = '';
				$.each(data['request'], function(k, v){
					if(!/^\$/.test(k)){
						var name = k.replace(/^([\w\d]+)\:?(.+)$/, '$1');
						var type = k.replace(/^([\w\d]+)\:?(.+)$/, '$2');
						if(/boolean/.test(type)){
							formElement += tpl.form.cover({
								type: type,
								content: tpl.form.toggle({
									label: name,
									name: name
								})
							});
						}else{
							formElement += tpl.form.cover({
								type: type,
								content: tpl.form.field({
									label: name,
									placeholder: type,
									type: 'text',
									name: name
								})
							});
						}
					}
				});
				$formContent.html(formElement);
				if(!formElement){
					$('.putData').remove();
				}
			} else {
				$('.putData').remove();
			}
		},

		events: {
//			'click #menu-bar li > a': 'onMenuItemClick',
			'keyup #form input': 'sendOnEnter',
			'submit #form': 'onSubmit'
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
			$("#responseHeadersNonFormat").html(jqXHR.getAllResponseHeaders());
			$("#errors").html("");
			if($.isPlainObject(response)){
				$("#responseHTML").html("");
				$("#responseJSON").html(window.jsonFormat(response));
				$("#response").text(JSON.stringify(response));
			}else{
				$("#responseJSON").html("");
				$("#response").text(response);
				$("#responseHTML").html(response);
			}
			$('#sendInfo').html(window.jsonFormat({
				time: (Date.now() - time)/1000,
				encoding: jqXHR.getResponseHeader('Content-Encoding'),
				compress: (100 - Math.round((+jqXHR.getResponseHeader('Content-Length') / jqXHR.responseText.length)*100)) + '%'
			}));
		},

		onRequestError: function (requestObj, jqXHR) {
			var resp = jqXHR.responseText,
				isJSON = false;

			var respHtml = jqXHR.responseText.replace(/[<]!DOCTYPE(?:[^>]*)[>]/g, '');
			respHtml = respHtml.replace(/<\/?html[^>]+>/g, '');

			$("#responseHeadersNonFormat").html(jqXHR.getAllResponseHeaders());

			try {
				resp = window.jsonFormat(JSON.parse(jqXHR.responseText, true));
				isJSON = true;
			} catch (e) {
				resp = respHtml;
				isJSON = false;
			}

			$("#responseHTML").html("");
			$("#responseJSON").html(isJSON ? resp : "");
			$("#errors").html(
				'<div class="alert alert-danger">' +
					'<h4>Ajax Error <b>' + jqXHR.status + '</b> (<i>' + status + '</i>)</h4>' +
					'<p>' + jqXHR.statusText + '</p><br>' +
					(isJSON ? '' : '<div>' + resp + '</div>') +
					'</div>'
			);
			$("#response").text(jqXHR.responseText);
			$('#sendInfo').html(window.jsonFormat({
				time: (Date.now() - time)/1000
			}));
		},

		onSubmit: function () {

			var requestObj = {
				time: Date.now()
			};

			var that = this;
			var param = $(this).serializeArray();

			window.saveSendDataToStore(param);

			var pararms = {
				type: $method.val(),
				url: $url.val(),
				data: param
			};

			var strParam = $.param(param);

			var jsonParam = {};

			for(var i = 0; i < param.length; i++){
				jsonParam[param[i].name] = param[i].value;
			}

			var resultParams = param;

			var resultParamsStr = strParam;

			if($format.val() === "json" && pararms.type !== "GET"){
				resultParams = jsonParam;
				resultParamsStr = JSON.stringify(resultParams);
				pararms.contentType = 'json';
				pararms.dataType = 'json';
			}

			$("#requestParams").html(window.jsonFormat(jsonParam));
			$("#requestDataNonFormat").text(resultParamsStr);

			var options = $.extend({}, pararms, {
				data: resultParamsStr,
				success: function(response, _$, jqXHR){
					that.onRequestSuccess(requestObj, response, jqXHR);
				},
				error: function(jqXHR, status){
					that.onRequestError(requestObj, jqXHR);
				}
			});
			$.ajax(options);
			return false;
		}
	};

	var form = new Form(SPECS);

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
})(window, window.jQuery, window._, window.templateCompiler);