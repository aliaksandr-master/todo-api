'use strict';

(function(window, $){
	var JSONFormatter = window.JSONFormatter;

	$(function(){

		$("form [name]:not([placeholder])").each(function(){
			$(this).attr("placeholder", $(this).attr("name"));
		});
		$("form input[name]").addClass("form-control");
		$("form textarea[name]").addClass("form-control");

		$("form").on("keyup", "textarea,input", function(e){
			if(e.keyCode == 13){
				$(this).closest("form").submit();
			}
		});

		$("#form-submit").click(function(){
			$('#formS form').eq(0).submit();
		});

		var $form = $("#formS form"),
			$method = $('#_METHOD_'),
			$format = $("#_FORMAT_"),
			$url = $('#_URL_');

		$method.val(($form.attr("method") || "").toUpperCase() || "GET");
		$url.val(($form.attr("action") || "") || "/");
		$format.val($form.attr("data-format") || "json");

		$(document.body).on("submit", "form", function(){

			var session = $("#_USER_SESSION_").val();
			var param = $(this).serializeArray();

			if(session.length){
				param.push({
					name: "session_id",
					value: session
				});
			}

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

			$("#requestParams").html(JSON.stringify(jsonParam, null, 4));
			$("#requestDataNonFormat").text(resultParamsStr);

			var options = $.extend({}, pararms,{
				data: resultParamsStr,
				success: function(response, _$, jqXHR){
					$("#responseHeadersNonFormat").html(jqXHR.getAllResponseHeaders());
					$("#errors").html("");
					if($.isPlainObject(response)){
						$("#responseHTML").html("");
						$("#responseJSON").html(JSON.stringify(response, null, 4));
						$("#response").text(JSON.stringify(response));
					}else{
						$("#responseJSON").html("");
						$("#response").text(response);
						$("#responseHTML").html(response);
					}
				},
				error: function(jqXHR, status){
					var resp, isJSON;

					$("#responseHeadersNonFormat").html(jqXHR.getAllResponseHeaders());

					try{
						resp = JSON.stringify(JSON.parse(jqXHR.responseText, true), null, 4);
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
				}
			});
			$.ajax(options);
			return false;
		});
	});
})(window, window.jQuery);