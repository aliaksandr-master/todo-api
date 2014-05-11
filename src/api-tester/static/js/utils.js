"use strict";

(function(window, $, _, Handlebars){

	window.spec = function(){
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
	// FROM REMOTE
	window.templateCompiler = function(path, isRemote){
		if(!isRemote){
			return function(params){
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
		return Boolean(window.randomInteger(0, 2) - 1);
	};

	var prevData = [];
	window.saveSendDataToStore = function(data){
		prevData = data;
	};
	window.loadSendDataToStore = function(){
		return prevData;
	};

	window.utils = {

		// Adds params to the given url, including array params (key name will be duplicated in this case)
		addParamsToUrl: function(url, params) {
			var paramsStr = this.queryParams.stringify(params),
				lastSymbol;

			if (!paramsStr) {
				return url;
			}

			if (url.indexOf('?') !== -1) {
				lastSymbol = url[url.length - 1];
				if (lastSymbol !== '?' && lastSymbol !== '&') {
					url += '&';
				}
			} else {
				url += '?';
			}

			return url + paramsStr;
		},

		queryParams: {
			stringify: function(queryParams) {
				var arrParam, encodedKey, key, query, stringifyKeyValuePair, value, _i, _len;
				query = '';
				stringifyKeyValuePair = function(encodedKey, value) {
					if (value != null) {
						return '&' + encodedKey + '=' + encodeURIComponent(value);
					} else {
						return '';
					}
				};
				_.each(queryParams, function (value, key) {
					encodedKey = encodeURIComponent(key);
					if (_.isArray(value)) {
						for (_i = 0, _len = value.length; _i < _len; _i++) {
							arrParam = value[_i];
							query += stringifyKeyValuePair(encodedKey, arrParam);
						}
					} else {
						query += stringifyKeyValuePair(encodedKey, value);
					}
				});
				return query && query.substring(1);
			},
			parse: function(queryString) {
				var current, field, pair, pairs, params, value, _i, _len, _ref;
				params = {};
				if (!queryString) {
					return params;
				}
				pairs = queryString.split('&');
				for (_i = 0, _len = pairs.length; _i < _len; _i++) {
					pair = pairs[_i];
					if (!pair.length) {
						continue;
					}
					_ref = pair.split('='), field = _ref[0], value = _ref[1];
					if (!field.length) {
						continue;
					}
					field = decodeURIComponent(field);
					value = decodeURIComponent(value);
					current = params[field];
					if (current) {
						if (current.push) {
							current.push(value);
						} else {
							params[field] = [current, value];
						}
					} else {
						params[field] = value;
					}
				}
				return params;
			}
		},

		parseUrl: function (url) {
			//http://username:password@www.hostname.com/somedir/somesubdir/path.hello.html?arg=value#anchor[a]=123
			var keys = ['url', 'scheme', 'authority', 'userInfo', 'username', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'fragment'],
				result = {},
				i = 14,
				parsed = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(url || '');
			while (i--) {
				if (parsed[i]) {
					result[keys[i]] = parsed[i];
				}
			}
			// QUERY STRING PARSE
			if(result['query']){
				result['data'] = {};
				result['query'].replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, $1, $2) {
					if($1){
						result['data'][$1] = $2;
					}
				});
			}
			if (result.file) {
				result.fileName = result.file.replace(/\.([^.]+$)/, '');
				result.fileExt = result.file.split('.').pop();
				if (result.fileName === result.file) {
					result.fileExt = '';
				}
			}
			return result;
		}
	};

})(window, window.jQuery, window._, window.Handlebars);