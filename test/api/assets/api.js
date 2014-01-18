"use strict";
(function(window, $, Handlebars, _, undefined){

	var SPACES = 2;

	var API     = window.api();
	var tplMenu  = window.tpl('menu.hbs');
	var tplMain  = window.tpl('main.hbs');
	var tplPanel = window.tpl('panel.hbs');
	var tplFormField  = window.tpl('form/field.hbs');
	var tplFormText   = window.tpl('form/text.hbs');
	var tplCover      = window.tpl('form/cover.hbs');
	var tplFormToggle = window.tpl('form/toggle.hbs');
	var tplFormSelect = window.tpl('form/select.hbs');

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
				type: 'success',
				id: 'responseHTML',
				content: ''
			}));
			$requestPanels.append(tplPanel({
				label: "Send <b>Info</b>",
				type: 'primary',
				id: 'sendInfo',
				content: ''
			}));
			$responsePanels.append(tplPanel({
				label: "Respoonse",
				type: 'success',
				id: 'response',
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
				type: 'info',
				id: 'requestDataNonFormat',
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
				text: k.replace(/^([a-zA-Z]+)\s+(.+)$/, '$2'),
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
					var formElement = '';
					$.each(data['request'], function(k, v){
						if(!/^\$/.test(k)){
							var name = k.replace(/^([\w\d]+)\:?(.+)$/, '$1');
							var type = k.replace(/^([\w\d]+)\:?(.+)$/, '$2');
							if(/bool/.test(type)){
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
					resultParamsStr = $.param({
						json: JSON.stringify(resultParams)
					});
				}

				$("#requestParams").html(JSON.stringify(jsonParam, null, SPACES));
				$("#requestDataNonFormat").text(resultParamsStr);

				var time = Date.now();
				var options = $.extend({}, pararms,{
					data: resultParamsStr,
					success: function(response, _$, jqXHR){
						$("#responseHeadersNonFormat").html(jqXHR.getAllResponseHeaders());
						$("#errors").html("");
						if($.isPlainObject(response)){
							$("#responseHTML").html("");
							$("#responseJSON").html(JSON.stringify(response, null, SPACES));
							$("#response").text(JSON.stringify(response));
						}else{
							$("#responseJSON").html("");
							$("#response").text(response);
							$("#responseHTML").html(response);
						}
						$('#sendInfo').html(JSON.stringify({
							time: (Date.now() - time)/1000
						}, null, SPACES));
					},
					error: function(jqXHR, status){
						var resp, isJSON;

						$("#responseHeadersNonFormat").html(jqXHR.getAllResponseHeaders());

						try{
							resp = JSON.stringify(JSON.parse(jqXHR.responseText, true), null, SPACES);
							isJSON = true;

						}catch(e){
							resp = jqXHR.responseText;
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
						$('#sendInfo').html(JSON.stringify({
							time: (Date.now() - time)/1000
						}, null, SPACES));
					}
				});
				$.ajax(options);
				return false;
			});
		}
	});
})(window, jQuery, Handlebars, _, undefined);