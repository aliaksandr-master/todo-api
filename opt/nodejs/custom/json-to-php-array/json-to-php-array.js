"use strict";

var _ = require('lodash');

var json2php = function (data, compress) {
	compress = compress == null ? true : Boolean(compress);
	var _json2php,
		_compact;

	_compact = function (objOrArray) {
		var isArray = _.isArray(objOrArray);
		var result = isArray ? [] : {};
		_.each(objOrArray, function (v, k) {
			if (v !== undefined) {
				if (isArray) {
					result.push(v);
				} else {
					result[k] = v;
				}
			}
		});
		return result;
	};

	_json2php = function(obj) {
		var result;
		switch (Object.prototype.toString.call(obj)) {
			case '[object Boolean]':
				result = obj ? 'true' : 'false';
				break;
			case '[object String]':
				result = "'" + obj.replace(/\\/g, '\\\\').replace(/\'/g, "\\'") + "'";
				break;
			case '[object Number]':
				result = obj.toString();
				break;
			case '[object Array]':
				result = 'array(' + _compact(obj).map(_json2php).join(compress ? ',': ", ") + ')';
				break;
			case '[object Object]':
				result = [];
				_.each(_compact(obj), function (v, k) {
					result.push(_json2php(k) + (compress ? "=>": " => ") + _json2php(v));
				});
				result = "array(" + result.join(compress ? ',': ", ") + ")";
				break;
			default:
				result = 'null';
		}
		return result;
	};

	if (_.isObject(data) || _.isArray(data)) {
		data = _compact(data);
	}
	if (data === undefined) {
		return 'null';
	}
	return _json2php(data);
};

module.exports = json2php;