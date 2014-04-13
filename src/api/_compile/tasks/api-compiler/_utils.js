"use strict";

var _ = require('lodash');

module.exports = function (options, mainOptions) {

	function mkObject (key, value) {
		var a = {};
		a[key] = value;
		return a;
	}

	function filterKeyMap (object, filterer, callback, byKey) {
		var filter, objArr, filtered;
		byKey = byKey == null ? true : !!byKey;

		if (_.isRegExp(filterer)) {
			filter = function (obj) {
				return filterer.test(byKey ? obj.key : obj.value);
			};
		} else if (_.isString(filterer) || _.isNumber(filterer)) {
			filter = function (obj) {
				return (byKey ? obj.key : obj.value) === filterer;
			};
		} else if (_.isArray(filterer)) {
			filter = function (obj) {
				return _.include(byKey ? obj.key : obj.value, filterer);
			};
		} else if (_.isFunction(filterer)) {
			filter = function (obj) {
				return filterer(obj.key, obj.value, object);
			};
		} else {
			throw new Error('Invalid filterer type');
		}

		objArr = _.map(object, function (v, k) {
			return {
				key: k,
				value: _.isObject(v) ? _.merge({}, v) : v
			};
		});

		filtered = _.filter(objArr, filter);

		if (!callback) {
			return filtered;
		}

		var a = _.map(filtered, function (obj, index) {
			var args = [obj.key, obj.value];
			if (_.isRegExp(filterer)) {
				obj.key.replace(filterer, function () {
					args.push(_.toArray(arguments));
				});
			}
			return callback.apply(null, args);
		});

		return _.compact(a);
	}

	function cascade (objArr, main) {
		var mainObj;
		if (_.isObject(main)) {
			mainObj = main;
		} else if (_.isString(main) || _.isNumber(main)) {
			mainObj = _.find(objArr, function (v) {
				return v[main] != null;
			}) || {};
			mainObj = mainObj[_.keys(mainObj)[0]];
		} else if (_.isFunction(main)) {
			mainObj = _.find(objArr, main);
		}

		if (!mainObj) {
			return _.merge({}, objArr);
		}

		return  _.map(objArr, function (obj) {
			var main = _.merge({}, mainObj);
			var firstKey = _.keys(obj)[0];
			return mkObject(firstKey, _.merge(main, obj[firstKey]));
		});
	}

	var newCompile = function (jsonData) {

		var DEFAULT_OPTIONS_NAME = '_default_';

		var optionsByMethod = [];
		var optionsByUri = [];

		options = filterKeyMap(jsonData, /^options(?:\s+([^\s]+))?(?:\s+\/([^\s]*))?\s*$/i, function (key, object, arg1) {
			var name = arg1[1] || DEFAULT_OPTIONS_NAME;
			return mkObject(name, object);
		});

		options = cascade(options, DEFAULT_OPTIONS_NAME);

		var resourcesByMethod = [];
		var resourcesByUri = [];


		var resources = filterKeyMap(jsonData, /^resource(?:\s+([^\s]+))?(?:\s+\/([^\s]*))?\s*$/i, function (key, object, arg1) {
			return mkObject(arg1[1], object);
		});

		return {
			options: options,
			resources: resources
		};
	};

	var utils;

	var parseFilter = function (str, apiName) {
		var formatExp = /^([\w\d]+)(.*)$/i;
		if (str) {
			var parts = str.replace(/^\|/, '').split(/\s*\|\s*/g);

			return _.map(parts, function (part) {
				var filterName   = part.replace(formatExp, '$1');
				var filterParams = part.replace(formatExp, '$2').replace(/'/g, '"');
				if (filterParams) {
					try {
						filterParams = JSON.parse(filterParams);
					} catch (e) {
						throw new Error('"' + apiName + '" has invalid JSON format in FILTERS "' + part + '"');
					}
				}
				var obj = {};
				obj[filterName] = filterParams || [];
				return obj;
			});
		}
		return [];
	};


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

	var hasRule = function (object, ruleName) {
		var r = object.validation && _.any(object.validation.rules, function (rule) {
			return rule[ruleName] != null;
		});
		return!!r;
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
		return category === '$' ? 'args' : (category === '?' ? 'query' : 'BODY');
	};

	var typeFormat = (function () {

		return function (typeString, defaultType, apiName) {
			typeString = typeString || defaultType;
			var found = _.any(options.types, function (obj, typeName) {
				return typeString === typeName;
			});
			if (!found) {
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

	var addFilter = function (object, toEnd, name, params) {
		if (!object.filters) {
			object.filters = [];
		}
		var obj = {};
		obj[name] = params || [];
		toEnd ? object.filters.push(obj) : object.filters.unshift(obj);
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
		str.replace(/^([\?$]?)([\w][\w\d]*)(?:\:?([a-zA-Z]*))(?:\{([^\}]+)\})?(\|[^\|]+)*$/, function (word, category, name, type, len, filters) {
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
				filters: parseFilter(filters, apiName)
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

	var applyTypeOptions = function (obj, callback) {
		_.each(obj, function (objT) {
			var name = objT;
			var params = [];
			if (_.isObject(objT)) {
				name = _.keys(objT)[0];
				params = _.isArray(objT[name]) ? objT[name] : [objT[name]];
			}
			callback(name, params, objT);
		});
	};

	var parseRequestOption = function (optionData, optionName, apiName) {

		var result = utils.parse.paramDirective(optionName, apiName);

		if (_.isEmpty(result)) {
			throw new Error(apiName + ': has invalid request format');
		}

		result = utils.parse.validation(result, optionData, apiName);

		var typeOption = options.types[result.type];

		if (result.length.min) {
			utils.addRule(result, 'min_length', [result.length.min], true, apiName);
		}
		if (result.length.max && result.length.max !== 'infinity') {
			utils.addRule(result, 'max_length', [result.length.max], true, apiName);
		}

		delete result.length;

		if (typeOption.filters) {
			applyTypeOptions(typeOption.filters, function (filterName, filterParams) {
				utils.addFilter(result, false, filterName, filterParams);
			});
		}

		applyTypeOptions(typeOption.rules, function (ruleName, ruleParams) {
			if (!hasRule(result, ruleName)) {
				utils.addRule(result, ruleName, ruleParams, true, apiName);
			}
		});

		return result;
	};

	var parseResponseOption = function (directive, _options, apiName){
		var response = null;
		directive.replace(/^response(?:\s*<\s*([1-9][0-9]*))?$/, function (word, limit) {
			response = {
				type: limit ? 'many' : 'one',
				limit: limit ? +limit : undefined
			};
			return '';
		});
		if (response == null){
			throw new Error(apiName + ': Invalid type of response param "'+directive+'" : \n'+JSON.stringify(_options,null, 4));
		}
		if (_.isArray(_options)) {
			_options = {data: _options};
		}
		response.output = {
			data: utils.parse.varParam({}, _options.data, apiName),
			meta: utils.parse.varParam({}, _options.meta, apiName)
		};
		if (!response.output.data && !response.output.meta){
			throw new Error(apiName + ': EMPTY response param ');
		}
		return response;
	};

	var compile = function(source){
		var resultApi = {};
		_.each(source, function(apiData, apiName){
			if (mainOptions.verbose) {
				console.log(apiName);
			}

			var title = apiName;
			var request = {};
			var response = {};
			var access = {
				need_login: false,
				only_owner: false
			};

			_.each(apiData, function(_options, directive){

				if (directive === 'access') {
					_.extend(access, _options);
					return;
				}

				if (directive === 'title') {
					title = _options;
					return;
				}

				if (/^request/.test(directive)) {
					if (!_.isEmpty(request)) {
						throw new Error(apiName + ': must have one directive "request"');
					}
					request.input = _.map(_options, function(option, optionName){
						if (_.isObject(option)){
							optionName += option.filters ? '|' + option.join('|') : '';
							option = option.rules || '';
						}
						return parseRequestOption(option, optionName, apiName);
					});
					return;
				}
				if (/^response/.test(directive)) {
					if (!_.isEmpty(response)) {
						throw new Error(apiName + ': must have one directive "response"');
					}
					response = parseResponseOption(directive, _options, apiName);
				}
			});

			request.input = _.groupBy(request.input, 'category');
			var _requestInput = {};
			_.each(request.input, function (params, type) {
				_requestInput[type] = {};
				_.each(params, function (param) {
					_requestInput[type][param.name] = _.omit(param, 'category');
				});
			});
			request.input = _requestInput;

			if (request.input.args) {
				_.each(request.input.args, function (params, name) {
					var existsInUrl =
						apiName.indexOf(' $' + name + ' ') !== -1 ||
							apiName.indexOf(' $' + name + '/') !== -1 ||
							apiName.indexOf('/$' + name + '/') !== -1 ||
							apiName.indexOf('/$' + name) !== -1;
					if (!existsInUrl) {
						throw new Error('"' + apiName + '" param "' + name + '" was not attach to url string');
					}
				});
				request.input.args = _.sortBy(request.input.args, "url_index");
			}

			var parseApi = utils.parse.apiName(apiName);

			if (!/^POST|HEAD|OPTION|DELETE|GET|PUT|PATCH$/.test(parseApi.method)) {
				throw new Error(apiName + ': invalid method type "' + parseApi.method + '"');
			}

			// RESULT
			var api = {};
			api['url'] = parseApi.url;
			api['title'] = title;
			api['name'] = apiName;
			api['request'] = request;
			api['request'].method = parseApi.method;
			api['response'] = response;
			api['access'] = access;
			api['version'] = parseApi.version;

			var id = utils.make.apiCellName(parseApi.method, parseApi.url, api['params_count']);
			resultApi[id] = api;
		});
		return resultApi;
	};

	utils = {
		compile: compile,
		parse: {
			requestOption: parseRequestOption,
			responseOption: parseResponseOption,
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

	return utils;

};