define(function(require, exports, module){
    "use strict";

	var Handlebars = require('handlebars');
	var $ = require('jquery');
	var _ = require('lodash');

	var tplMemo = {};
	var cid = 0;

	var compile = function (tpl) {
		var r = Handlebars.compile(tpl);
		return function (data) {
			data = _.extend({
				cid: cid++
			},data);
			return r(data);
		};
	};

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
			tplMemo[path] = compile($e.html());
		} else {
			$.ajax({
				url: window.MY_ROOT + '/static/templates' + path,
				async: false,
				dataType: 'html',
				success: function(resp){
					result = compile(resp);
				}
			});
			tplMemo[path] = result;
		}

		return tplMemo[path];
	};
});