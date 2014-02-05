"use strict";

var _ = require('underscore');

var parseFilter = (function () {

	var filtersSepMap = {
		'before': ['^', /^\^/, /\s*\^\s*/g],
		'after':  ['|', /^\|/, /\s*\|\s*/g]
	};
	var formatExp = /^([\w\d]+)(.*)$/i;
	return function (str, name, apiName) {
		if (str) {
			var sep = filtersSepMap[name],
				parts = str.replace(sep[1], '').split(sep[2]);

			return _.map(parts, function (part) {
				var filterName   = part.replace(formatExp, '$1');
				var filterParams = part.replace(formatExp, '$2').replace(/'/g, '"');
				if (filterParams) {
					try {
						filterParams = JSON.parse(filterParams);
					} catch (e) {
						throw new Error('"' + apiName + '" has invalid JSON format in ' + name.toUpperCase() + '_FILTERS "' + part + '"');
					}
				}
				var obj = {};
				obj[filterName] = filterParams || [];
				return obj;
			});
		}
		return [];
	};
})();


var parseParams = function (param, apiName){
	var params = [];
	if (param != null) {
		params = param;
		if (_.isString(param)) {
			try {
				params = JSON.parse(param.replace(/'/g, '"'), true);
			} catch (e) {
				throw new Error('"' + apiName + '" has invalid JSON format in params "' + param + '"');
			}
		}
		if (!_.isArray(params)) {
			params = [params];
		}
	}
	return params;
};

var validationRuleParamsFormat = function (param, apiName) {
	return parseParams(param || null, apiName) || [];
};

var parseStrArray = function (strOrArray, apiName) {
	if (_.isString(strOrArray)) {
		strOrArray = strOrArray.split(/\s*\|\s*/);
	}
	if (!_.isArray(strOrArray)) {
		throw new Error('"' + apiName + '" has invalid sting-array format "' + JSON.stringify(strOrArray, null, 4) + '"');
	}
	return strOrArray;
};

var addRule = function (object, ruleName, params, toStart, apiName) {
	ruleName = ruleName.trim();
	if (!object.validation) {
		object.validation = {
			required: true,
			rules: []
		};
	}
	if (ruleName === 'required' || ruleName === 'optional') {
		object.validation.required = ruleName === 'required';
	} else {
		var obj = {};
		obj[ruleName] = validationRuleParamsFormat(params, apiName);
		if (toStart) {
			object.validation.rules.unshift(obj);
		} else {
			object.validation.rules.push(obj);
		}

	}
};

var parseValidation = (function () {
	var formatExp = /^([a-z0-9_]+)(.*)$/i;
	return function (result, option, apiName){
		_.each(parseStrArray(option, apiName), function(rule){
			var ruleName    = rule.replace(formatExp, '$1'),
				paramString = rule.replace(formatExp, '$2');
			addRule(result, ruleName, paramString, false, apiName);
		});
		return result;
	};
})();

var categoryFormat = function (category) {
	return category === '$' ? 'URL' : (category === '?' ? 'QUERY' : 'BODY');
};

var typeFormat = (function () {

	var TYPES_EXP = /^(?:text|string|integer|decimal|float|boolean)$/i;

	return function (typeString, defaultType, apiName) {
		typeString = typeString || defaultType;
		if (!TYPES_EXP.test(typeString)) {
			throw new Error('"' + apiName + '" has invalid format in type "'+typeString+'"');
		}
		return typeString;
	};
})();

var rangeFormat = function (rangeString, apiName) {
	var range,
		minLength = null,
		maxLength = null;

	if (rangeString) {
		range = rangeString.trim().split(/\s*,\s*/);
		minLength = range[0];
		maxLength = range.length === 1 ? range[0] : range[1];

		if (range.length === 2) {
			if (!minLength.length) {
				minLength = null;
			}
			if (!maxLength.length) {
				maxLength = 'infinity';
			}
		}

		if (/^[0-9]+$/.test(maxLength)) {
			maxLength = +maxLength;
		}

		if (/^[0-9]+$/.test(minLength)) {
			minLength = +minLength;
		}

		if (range.length > 2 || !range.length || (/^[0-9]+,[0-9]+$/.test(rangeString) && minLength > maxLength)) {
			throw new Error ('"' + apiName + '" has invalid format in Range "{' + rangeString + '}"');
		}

	}

	return [minLength, maxLength];
};

var addFilter = function (object, toEnd, type, name, params) {
	if (!object.filters) {
		object.filters = {
			before: [],
			after: []
		};
	}
	var obj = {};
	obj[name] = params || [];
	toEnd ? object.filters[type].push(obj) : object.filters[type].unshift(obj);
};

var makeCellName = function(method, url){
	return method + ':' + url.replace(/\$[^\/]+/g, '<param>');
};

var parseApiName = function (apiName) {
	var formatExp = /^([A-Z]+)\s+(.+)$/;
	var method = apiName.replace(formatExp, "$1");
	var url = apiName.replace(formatExp, "$2").split(' ')[0];
	var version = apiName.replace(formatExp, "$2").split(' ')[1];
	return {
		method: method,
		url: url,
		version: version
	};
};

var parseParamDirective = function (str, apiName) {
	var parsed = {};
	str.replace(/^([\?$]?)([\w][\w\d]*)(?:\:?([a-zA-Z]*))(?:\{([^\}]+)\})?(\^[^\^\|]+)*(\|[^\|]+)*$/, function (word, category, name, type, len, beforeFilters, afterFilters) {
		type = typeFormat(type, 'string', apiName);

		var range = rangeFormat(len, apiName);

		parsed = {
			category: categoryFormat(category),
			name: name,
			type: type,
			length: {
				min: range[0],
				max: range[1]
			},
			filters: {
				before: parseFilter(beforeFilters, 'before', apiName),
				after: parseFilter(afterFilters,  'after', apiName)
			}
		};
	});
	return parsed;
};

var parseVarParam = function (startValue, varParam, apiName) {
	_.each(varParam, function (option) {
		var resultParamObject = parseParamDirective(option, apiName);
		if (_.isEmpty(resultParamObject)){
			throw new Error(apiName + ': has invalid format "'+option+'"');
		}

		delete resultParamObject.category;
		delete resultParamObject.length;

		if (_.isArray(startValue)) {
			startValue.push(resultParamObject);
		} else {
			startValue[resultParamObject.name] = resultParamObject;
		}
	});
	return startValue;
};

module.exports = {
	parse: {
		paramDirective: parseParamDirective,
		filter: parseFilter,
		params: parseParams,
		varParam: parseVarParam,
		apiName: parseApiName,
		validation: parseValidation,
		strArray: parseStrArray
	},
	format: {
		ruleParam: validationRuleParamsFormat,
		category: categoryFormat,
		type: typeFormat,
		range: rangeFormat
	},
	addRule: addRule,
	addFilter: addFilter,
	make: {
		apiCellName: makeCellName
	}
};