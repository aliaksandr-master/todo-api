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
	window.jsonFormat = function(obj){
		var json = JSON.stringify(obj, null, 2);
		json = json.replace(/^(\s*"[^:]*"\s*\:\s*)?['"](.*)['"]([^\w\d]*)?$/gm, '$1<b class=\'string\'>"$2"</b>$3');
//		json = json.replace(/^(\s*)"([^:]+)"\s*\:\s*(.+)$/gm, '$1<b class=\'index\'>$2</b><i class=\'coma\'>:</i> $3');
		json = json.replace(/([\{\}\[\]])/g, '<i class=\'braked\'>$1</i>');
		json = json.replace(/([^\w\d])(true|false)([^\w\d]*)$/gm, '$1<b class=\'bool\'>$2</b>$3');
		json = json.replace(/([^\w\d])((?:[+-])?(?:\d+\.)?\d+)([^\w\d]*)$/gm, '$1<b class=\'number\'>$2</b>$3');

		return json;
	};

	window.randomString = function(length, hasNumber){
		var text = "",
			possible = "abcdefghijklmnopqrstuvwxyz" + (hasNumber ? '0123456789' : '');
		for( var i=0; i < length; i++ ){
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	};

	window.randomInteger = function(start, stop){
		return Math.ceil((start||0) + Math.random() * stop);
	};

	window.randomBoolean = function(){
		return!!(window.randomInteger(0, 2) - 1);
	};

	var prevData = [];
	window.saveSendDataToStore = function(data){
		prevData = data;
	};
	window.loadSendDataToStore = function(){
		return prevData;
	};


})(window, jQuery);