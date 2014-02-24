"use strict";
(function(window, $, Handlebars, _, undefined){

	var API     = window.api();
	var tplMenu  = window.tpl('menu');
	var tplMain  = window.tpl('main');
	var tplPanel = window.tpl('panel');
	var tplFormField  = window.tpl('form-field');
	var tplFormText   = window.tpl('form-text');
	var tplCover      = window.tpl('form-cover');
	var tplFormToggle = window.tpl('form-toggle');
	var tplFormSelect = window.tpl('form-select');

	function Form(){

	}Form.prototype = {
		buildMainTemplate: function(){
			$(document.body).html(tplMain({
				action: window.API_ROOT
			}));
			var $responsePanels = $('#response-panels');
			var $requestPanels = $('#request-bar');

			$responsePanels.append(tplPanel({
				label: "Respoonse <b>API</b>",
				type: 'success',
				id: 'responseJSON',
				content: ''
			}));
			$responsePanels.append(tplPanel({
				label: "Respoonse <b>HTML</b>",
				type: 'default',
				id: 'responseHTML',
				content: ''
			}));
			$requestPanels.append(tplPanel({
				label: "Send <b>Info</b>",
				type: 'default',
				id: 'sendInfo',
				content: ''
			}));
			$requestPanels.append(tplPanel({
				label: "Request <b>Data</b> (formatted)",
				type: 'info',
				id: 'requestParams',
				content: ''
			}));
			$requestPanels.append(tplPanel({
				label: "Response <b>Headers</b>",
				type: 'success',
				id: 'responseHeadersNonFormat',
				content: ''
			}));
			$requestPanels.append(tplPanel({
				label: "Request <b>Data</b>",
				type: 'default',
				id: 'requestDataNonFormat',
				content: ''
			}));
			$requestPanels.append(tplPanel({
				label: "Response <b>Data</b>",
				type: 'default',
				id: 'response',
				content: ''
			}));
		}
	};

	var form = new Form();

	$(function(){

		form.buildMainTemplate();

		var $form = $("#form");
		var $formContent = $('#form-content');
		var $menu = $("#menu-bar");
		var nameMap = {};
		var currName = null;
		var currMethod = null;
		var currLocation = (window.location.href + "").replace(/^[^\#]+\#?(.*)$/, "$1");
		var map = {};
		_.each(API, function(v, k){
			var name = k.replace(/\s/, '');
			nameMap[name] = k;
			var method = k.replace(/^([a-zA-Z]+).+$/, '$1');
			if(!map[method]){
				map[method] = [];
			}
			map[method].push({
				name: name,
				text: (v.title || k).replace(/^(POST|PUT|DELETE|GET|PATCH|HEAD|OPTION)\s+(.+)$/, '$2'),
				link: '#' + name
			});
			if((currLocation && currLocation == name) || (!currLocation && !currName)){
				currName = name;
				currMethod = method;
			}
		});
		var _map = [];
		_.each(map, function(v, k){
			_map.push({
				index: _map.length,
				name: k,
				links: v
			});
		});

		$menu.append(tplMenu({data: _map}));
		$("#accordion")
			.collapse();

		$menu.on('click', 'li > a', function(){
			window.location.href = $(this).attr("href");
			window.location.reload();
			return false;
		});
		$menu.find('.active').removeClass('active');
		$menu.find('[data-method="'+currMethod+'"]').addClass('in');
		$menu.find('[data-name="'+currName+'"]').parent().addClass('active');

		// BUILD FORM
		if(API[nameMap[currName]]){
			(function(){
				var curr = nameMap[currName];

				$("#mainHeader").html(curr);
				var data = API[nameMap[currName]];
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
									value = window.randomString(10) + '@' + window.randomString(5) + '.' + window.randomString(3)
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
								formElement += tplCover({
									type: type,
									content: tplFormToggle({
										label: name,
										name: name
									})
								});
							}else{
								formElement += tplCover({
									type: type,
									content: tplFormField({
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
			})();

			$form.on("keyup", "textarea,input", function (e) {
				if (e.keyCode === 13) {
					$(this).closest("form").submit();
				}
			});

			var $method = $('#_METHOD_'),
				$format = $("#_FORMAT_"),
				$url = $('#_URL_');

			$method.val(($form.attr("method") || "").toUpperCase() || "GET");
			$url.val(($form.attr("action") || "") || "/");

			$form.on("submit", function(){
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

				if($format.val() === "json" && pararms.type != "GET"){
					resultParams = jsonParam;
					resultParamsStr = JSON.stringify(resultParams);
					pararms.contentType = 'json';
					pararms.dataType = 'json';
				}

				$("#requestParams").html(window.jsonFormat(jsonParam));
				$("#requestDataNonFormat").text(resultParamsStr);

				var time = Date.now();
				var options = $.extend({}, pararms,{
					data: resultParamsStr,
					success: function(response, _$, jqXHR){
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
							time: (Date.now() - time)/1000
						}));
					},
					error: function(jqXHR, status){
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
					}
				});
				$.ajax(options);
				return false;
			});
		}
	});
})(window, jQuery, Handlebars, _, undefined);