define(function(require, exports, module){
    "use strict";

	var Handlebars = require('handlebars');
	var $ = require('jquery');

	var tplMemo = {};

	// FROM REMOTE
	return function(path){

		path = '/' + path + '.hbs';

		if(tplMemo[path] != null){
			return tplMemo[path];
		}

		var result = function(){
			return "";
		};

		var $e = $('script[data-src="' + path + '"]');

		if($e.length){
			tplMemo[path] = Handlebars.compile($e.html());
		} else {
			$.ajax({
				url: window.MY_ROOT + '/static/templates' + path,
				async: false,
				dataType: 'html',
				success: function(resp){
					result = Handlebars.compile(resp);
				}
			});
			tplMemo[path] = result;
		}

		return tplMemo[path];
	};
});