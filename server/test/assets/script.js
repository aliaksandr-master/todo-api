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
			$url = $('#_URL_');

		$method.val(($form.attr("method") || "").toUpperCase() || "GET");
		$url.val(($form.attr("action") || "") || "/");

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

			var jsonParam = {
				timestamp: Date.now(),
				data: {}
			};

			for(var i = 0; i < param.length; i++){
				jsonParam.data[param[i].name] = param[i].value;
			}

			var resultParams = param;

			var resultParamsStr = strParam;

			if($("#_FORMAT_").val() === "json" && pararms.type != "GET"){
				resultParams = jsonParam;
				resultParamsStr = JSON.stringify(resultParams);
			}

			console.log(pararms);

			$("#requestParams").html("");
			$("#errors").html("");
			$("#responseJSON").html("");
			$("#responseHTML").html("");
			$("#response").html("");

			JSONFormatter.format(resultParams, {
				appendTo: '#requestParams', // A string of the id, class or element name to append the formatted json
				list_id: 'jsonParam' // The name of the id at the root ul of the formatted JSON
			});

			$("#requestDataNonFormat").text(resultParamsStr);

			$.ajax($.extend({}, pararms,{
				data: resultParamsStr,
				success: function(response){
					if($.isPlainObject(response)){
						JSONFormatter.format(response, {
							collapse: false, // Setting to 'true' this will format the JSON into a collapsable/expandable tree
							appendTo: '#responseJSON', // A string of the id, class or element name to append the formatted json
							list_id: 'json' // The name of the id at the root ul of the formatted JSON
						});
						$("#response").text(JSON.stringify(response));
					}else{
						$("#response").text(response);
						$("#responseHTML").html(response);
					}
				},
				error: function(jqXHR, status){
					console.log(jqXHR);
					$("#errors").html(
						'<div class="alert alert-danger">' +
							'<h4>' +
								'Ajax Error ' +
								'<b>' + jqXHR.status + '</b> ' +
								'(<i>' + status + '</i>)' +
							'</h4>' +
							'<p>' + jqXHR.statusText + '</p>' +
							'<div style="mergin-top: 20px;">' + jqXHR.responseText + '</div>' +
						'</div>'
					);
				}
			}));
			return false;
		});
	});
})(window, window.jQuery);