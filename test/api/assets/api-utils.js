"use strict";
(function(window, $){

	window.api = function(){
		var result = {};
		$.ajax({
			url: window.API_JSON,
			async: false,
			dataType: 'json',
			success: function(resp){
				result = resp;
			}
		});
		return result;
	};

	var tplMemo = {};
	window.tpl = function(path){
		var result = function(){
			return "";
		};
		return function(params){
			if(!tplMemo.hasOwnProperty(path)){
				$.ajax({
					url: window.MY_ROOT + 'templates/' + path,
					async: false,
					dataType: 'html',
					success: function(resp){
						result = Handlebars.compile(resp);
					}
				});
				tplMemo[path] = result;
			}
			return tplMemo[path](params);
		};
	};
})(window, jQuery);