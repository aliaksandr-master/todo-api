define(function(require, exports, module){
    "use strict";

	var _ = require('lodash');

	var map, types, compile;

	map = function (type, obj, options) {
		return _.map(obj, function (v, k) {
			var isIt = (types.object.check(v) || types.array.check(v)) && !_.isEmpty(v);
			var key = '<span ' + (isIt ? ' data-json-it-length="' + _.values(v).length + '" ' : '') +' class="json-f-key ' + (isIt ? 'json-f-v-it' : '') +' json-f-'+ type +'-key">' + k + '</span>';
			return '<span class="json-f-block">' + key + compile(v, options) + '</span>';
		}).join('');
	};

	types = {
		'string': {
			check: function (obj) {
				return _.isString(obj);
			},
			view: function (value, options) {
				value = value.trim();
				return '<span title="' + (/\n/.test(value) ? 'Multi-line ' : '') + 'String" class="json-f-value ' + (/\n/.test(value) ? 'json-f-mlt' : '') + ' json-f-smpl json-f-string">' + value + '</span>';
			}
		},
		'undefined': {
			check: function (obj) {
				return _.isUndefined(obj);
			},
			view: function (value, options) {
				return '<span title="Undefined" class="json-f-value json-f-smpl json-f-undefined">undefined</span>';
			}
		},
		'null': {
			check: function (obj) {
				return _.isNull(obj);
			},
			view: function (value, options) {
				return '<span title="Null" class="json-f-value json-f-smpl json-f-null">null</span>';
			}
		},
		'number': {
			check: function (obj) {
				return _.isNumber(obj);
			},
			view: function (value, options) {
				return '<span title="Number" class="json-f-value json-f-smpl json-f-number">' + value + '</span>';
			}
		},
		'object': {
			check: function (obj) {
				return _.isObject(obj) && !_.isArray(obj) && !_.isNull(obj);
			},
			view: function (value, options) {
				return '<span title="Object (' + _.keys(value).length + ')" class="json-f-value json-f-it json-f-object">' + map('object', value, options) + '</span>';
			}
		},
		'NaN': {
			check: function (obj) {
				return _.isNaN(obj);
			},
			view: function (value, options) {
				return '<span title="NaN" class="json-f-value json-f-smpl json-f-nan">NaN</span>';
			}
		},
		'array': {
			check: function (obj) {
				return _.isArray(obj);
			},
			view: function (value, options) {
				return '<span title="Array (' + value.length + ')" class="json-f-value json-f-it json-f-array">' + map('array', value, options) + '</span>';
			}
		},
		'boolean': {
			check: function (obj) {
				return _.isBoolean(obj);
			},
			view: function (value, options) {
				return '<span title="Boolean" class="json-f-value json-f-smpl json-f-boolean">' + value + '</span>';
			}
		}
	};

	compile = function (obj, options) {
		var result;
		_.any(types, function (objT, type) {
			if (objT.check(obj)) {
				result = objT.view(obj, options);
				return true;
			}
		});
		return result;
	};

	return function(obj, options){

		return '<span class="json-f-index">' + compile(obj, options, true) +'</span>';
	};
});