define(function(require, exports, module){
    "use strict";

	var Handlebars = require('handlebars');
	var $ = require('jquery');

	var tplMemo = {};
	// FROM REMOTE
	return function(path, isRemote){
		if(!isRemote){
			return function(params){
				path = path.replace(/^\/+|\.hbs$/g, '');
				params || (params = {});
				if(!tplMemo.hasOwnProperty(path)){
					tplMemo[path] = Handlebars.compile($('script[data-src="/' + path + '.hbs"]').html());
				}
				return tplMemo[path](params);
			};
		}
		var result = function(){
			return "";
		};
		return function(params){
			params || (params = {});
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
});