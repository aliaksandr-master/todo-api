define(function(require, exports, module){
    'use strict';

	var _ = require('lodash');
	var $ = require('jquery');

	return {

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

		removeParamFromUrl: function (url, paramNames) {
			if (!_.isArray(paramNames)) {
				paramNames = [paramNames];
			}
			var parsedUrl = this.parseUrl(url);
			var queryString = parsedUrl.query;
			var params = this.queryParams.parse(queryString);
			console.log(params);
			_.each(paramNames, function (name) {
				delete params[name];
			});
			queryString = this.queryParams.stringify(params);

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
});