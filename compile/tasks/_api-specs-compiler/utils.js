"use strict";

var _ = require('lodash');
var DirectiveFactory = require('./directive').factory;

module.exports = function (options) {

	var tryCascadeFuncCall = function (name, func, obj) {
		return function () {
			try {
				func.apply(obj, arguments);
			} catch (e) {
				var message = _.isString(e) ? e : e.message;
				throw new Error(name + ': ' +message);
			}
		};
	};

	var INFINITY_LENGTH = 'infinity';
	var METHODS_EXP = /^GET|PUT|POST|DELETE|OPTIONS|HEAD|CONNECT|TRACE$/i;

	var MAX_LIMIT = 255;

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

	var utils;

	var parseFilter = function (str) {
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
						throw new Error('has invalid JSON format in FILTERS "' + part + '"');
					}
				}
				var obj = {};
				obj[filterName] = filterParams || [];
				return obj;
			});
		}
		return [];
	};


	var parseParams = function (param){
		var params = [];
		if (param != null) {
			params = param;
			if (_.isString(param)) {
				try {
					params = JSON.parse(param.replace(/'/g, '"'), true);
				} catch (e) {
					throw new Error('has invalid JSON format in params "' + param + '"');
				}
			}
			if (!_.isArray(params)) {
				params = [params];
			}
		}
		return params;
	};

	var validationRuleParamsFormat = function (param) {
		return parseParams(param || null) || [];
	};

	var parseStrArray = function (strOrArray) {
		if (_.isString(strOrArray)) {
			strOrArray = strOrArray.split(/\s*\|\s*/);
		}
		if (!_.isArray(strOrArray)) {
			throw new Error('has invalid sting-array format "' + JSON.stringify(strOrArray, null, 4) + '"');
		}
		return strOrArray;
	};

	var addRule = function (object, ruleName, params, toStart) {
		ruleName = ruleName.trim();
		if (!object.verify) {
			object.verify = {
				required: true,
				rules: []
			};
		}
		if (ruleName === 'required' || ruleName === 'optional') {
			object.verify.required = ruleName === 'required';
		} else {
			var obj = {};
			obj[ruleName] = validationRuleParamsFormat(params);
			if (toStart) {
				object.verify.rules.unshift(obj);
			} else {
				object.verify.rules.push(obj);
			}

		}
	};

	var hasRule = function (object, ruleName) {
		var r = object.verify && _.any(object.verify.rules, function (rule) {
			return rule[ruleName] != null;
		});
		return!!r;
	};

	var checkType = function (typeString, defaultType, additionalTypes) {
		typeString = typeString || defaultType;
		var found = _.any(options.types, function (obj, typeName) {
			return typeString === typeName;
		});
		if (!found) {
			found = _.any(additionalTypes, function (typeName) {
				return typeString === typeName;
			});
		}
		if (!found) {
			throw new Error('has invalid format in type "'+typeString+'"');
		}
		return typeString;
	};

	var rangeFormat = function (rangeString) {
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
					maxLength = INFINITY_LENGTH;
				}
			}

			if (/^[0-9]+$/.test(maxLength)) {
				maxLength = +maxLength;
			}

			if (/^[0-9]+$/.test(minLength)) {
				minLength = +minLength;
			}

			if (range.length > 2 || !range.length || (/^[0-9]+,[0-9]+$/.test(rangeString) && minLength > maxLength)) {
				throw new Error ('has invalid format in Range "{' + rangeString + '}"');
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

	var parseParamDirective = function (str) {
		var parsed = {};
		str.replace(/^([a-zA-Z][a-zA-Z_0-9]*)(?:\:?([a-zA-Z0-9_]*))(?:\{([^\}]+)\})?(\|?.*)$/, function (word, name, type, len, filters) {
			type = checkType(type, 'string', []);

			var range = rangeFormat(len);

			parsed = {
				name: name,
				type: type,
				length: {
					min: range[0],
					max: range[1]
				},
				filters: parseFilter(filters)
			};
		});
		return parsed;
	};

	var parseVarParam = function (startValue, varParam) {
		var isArray = _.isArray(varParam);
		_.each(varParam, function (optionName, optionValue) {
			if (!isArray) {
				var _optionName = optionName;
				optionName = optionValue;
				optionValue = _optionName;
			}
			tryCascadeFuncCall(optionName, function () {
				var resultParamObject = parseParamDirective(optionName);
				if (_.isEmpty(resultParamObject)){
					throw new Error('has invalid format');
				}

				delete resultParamObject.length;

				if (_.isArray(startValue)) {
					startValue.push(resultParamObject);
				} else {
					startValue[resultParamObject.name] = resultParamObject;
				}
			})();
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

	var directiveFactory = new DirectiveFactory();

	directiveFactory.directive('routes', {
		default: [],
		need: true,
		verify: function (directiveKey, directiveValue, directives) {
			if (!_.isArray(directiveValue)) {
				throw new Error('"' + directiveKey +'" not array');
			}
			if (!directiveValue.length) {
				throw new Error('empty');
			}
		},
		process: function (directiveKey, directiveValue, directives) {
			return _.map(directiveValue, function (route) {
				if (_.isString(route)) {
					var segments = route.split(/\s+/);
					if (segments.length !== 2) {
						throw new Error('has invalid format "' + route +'", must be "METHOD URI_PATTERN"');
					}
					route = {
						method: segments[0],
						url: segments[1]
					};
				}
				if (!METHODS_EXP.test(route.method)) {
					throw new Error('has invalid method name "' + route.method + '"');
				}
				if (_.isEmpty(route.url)) {
					throw new Error('has empty url pattern');
				}
				route.method = route.method.toUpperCase();
				route.name = directives.name;
				return route;
			});
		}
	});

	directiveFactory.directive('response', {
		constructor: function () {
			this.nested.directive('statuses', {
				need: true,
				verify: function (directiveKey, directiveValue, directives) {
					if (!_.isArray(directiveValue)) {
						throw new Error('"' + directiveKey +'" not array');
					}
					if (!directiveValue.length) {
						throw new Error('empty');
					}
					_.each(directiveValue, function (status) {
						if (!options.statuses[status]) {
							throw new Error('undefined status id "' + status + '"');
						}
					});
				}
			});
		},
		default: {},
		process: function (directive, directiveData, directives) {
			var response = {};

			if (!_.isObject(directiveData)) {
				throw new Error('Invalid type, must be object');
			}

			var limit = directiveData.limit;
			if (limit != null) {
				limit = parseInt(directiveData.limit + '', 10);
				if (limit < 1 || limit !== directiveData.limit) {
					throw new Error('invalid limit format');
				}
			}
			response.output = {
				data: parseVarParam({}, directiveData.data),
				meta: parseVarParam({}, directiveData.meta),
				limit: limit
			};
			return response;
		}
	});

	directiveFactory.directive('request', {
		default: {},
		check: function (directive) {
			return (/^request/).test(directive);
		},
		process: function (directive, directiveData, apiData) {
			var input = {
				params: {},
				query: {},
				body: {}
			};

			_.each(directiveData, function (inputData, inputType) {
				if (input[inputType] == null) {
					throw new Error('undefined input type "' + inputType + '"');
				}

				input[inputType] = _.map(inputData, function(optionData, optionName){
					if (!_.isString(optionData)){
						optionName += optionData.filters ? '|' + optionData.join('|') : '';
						optionData = optionData.verify || [];
					}

					var result = parseParamDirective(optionName);

					if (_.isEmpty(result)) {
						throw new Error('has invalid request format');
					}

					var FORMAT_EXP = /^([a-z0-9_]+)(.*)$/i;
					_.each(parseStrArray(optionData), function(rule){
						var ruleName    = rule.replace(FORMAT_EXP, '$1'),
							paramString = rule.replace(FORMAT_EXP, '$2');
						addRule(result, ruleName, paramString, false);
					});

					var typeOption = options.types[result.type];

					if (result.length.min) {
						addRule(result, 'min_length', [result.length.min], true);
					}

					if (result.length.max && result.length.max !== INFINITY_LENGTH) {
						addRule(result, 'max_length', [result.length.max], true);
					}

					delete result.length;

					if (typeOption.filters) {
						applyTypeOptions(typeOption.filters, function (filterName, filterParams) {
							addFilter(result, false, filterName, filterParams);
						});
					}

					applyTypeOptions(typeOption.rules, function (ruleName, ruleParams) {
						if (!hasRule(result, ruleName)) {
							addRule(result, ruleName, ruleParams, true);
						}
					});

					return result;
				}, this);
			}, this);

			return {
				input: input
			};
		}
	});

	return function (sourceJSON, fpath) {
		var resultApi = {};

		var actions = {};
		var mainActionDirectives = {};

		_.each(sourceJSON, function (v, k) {
			if (/^\.[a-zA-Z_]+/.test(k)) {
				actions[k] = v;
			} else {
				mainActionDirectives[k] = v;
			}
		});

		mainActionDirectives.controller = mainActionDirectives.controller || fpath.replace(/^.+\/([^\.]+)\.spec\.js$/, '$1');

		if (_.isEmpty(mainActionDirectives.controller)) {
			throw new Error('undefined controller name at ' + fpath);
		}

		_.each(actions, function (actionDirectives, acctionName) {

			actionDirectives.action = acctionName.replace(/^\./, '');
			if (_.isEmpty(actionDirectives.action)) {
				throw new Error('undefined action name "' + acctionName + '"');
			}
			actionDirectives.name   = mainActionDirectives.controller + '.' + actionDirectives.action;
			actionDirectives.title  = actionDirectives.title == null ? actionDirectives.name : actionDirectives.title;

			var _mainActionDirectives = _.cloneDeep(mainActionDirectives);
			actionDirectives = _.merge(_mainActionDirectives, actionDirectives);

			tryCascadeFuncCall(actionDirectives.name, function () {
				directiveFactory.processAll(actionDirectives, _mainActionDirectives);
			})();

			// RESULT
			resultApi[actionDirectives.name] = actionDirectives;
		});
		return resultApi;
	};
};