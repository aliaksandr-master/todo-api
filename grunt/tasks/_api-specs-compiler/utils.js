"use strict";

var _ = require('lodash');
var DirectiveFactory = require('./directive').factory;

var METHODS_EXP = /^GET|PUT|POST|DELETE|OPTIONS|HEAD|CONNECT|TRACE$/i;

var VALIDATION_REQUIRED_DEFVAL = true;

var mkobj = function (k, v) {
	var o = {};
	o[k] = v;
	return o;
};

var tryCascadeFuncCall = function (name, func, obj) {
	return function () {
		try {
			func.apply(obj, arguments);
		} catch (e) {
			var errorObj = new Error(name + (e._origError ? ' >>> ' : '.') + e.message);
			errorObj._origError = true;
			throw errorObj;
		}
	};
};

module.exports = function (options) {

	var nestedTypes = {
		object: {
			filters: [],
			limit: false
		},
		array: {
			routeParamInfinite: true,
			filters: [],
			limit: true
		}
	};

	var verifyStringName = function (string, format) {
		format = format || options.stringNameFormat;
		if (format === 'camel') {
			if (!/^[a-z][a-zA-Z0-9]*$/.test(string)) {
				throw new Error('string "' + string + '" has invalid stringNameFormat, must be in camel case');
			}
		} else if (format === 'underscore') {
			if (!/^[a-z][a-z0-9_]*$/.test(string)) {
				throw new Error('string "' + string + '" has invalid stringNameFormat, must be in underscore case');
			}
		} else if (format) {
			throw new Error('options has invalid stringNameFormat name "' + format +'" ');
		}
		return string;
	};

	var optionsTypesNames = _.keys(options.types);
	var nestedTypesNames  = _.keys(nestedTypes);
	var availableTypes = _.extend({}, nestedTypes, options.types);
	var availableTypesNames = optionsTypesNames.concat(nestedTypesNames);

	if (_.intersection(optionsTypesNames, nestedTypesNames).length) {
		throw new Error('you can\'t use [' + nestedTypesNames.join(',') + '] types in options');
	}

	var parseParamsJSON = function (paramString){
		var params = [];
		if (paramString != null) {
			params = paramString;
			if (_.isString(paramString)) {
				try {
					params = JSON.parse(paramString, true);
				} catch (e) {
					throw new Error('has invalid JSON format in params "' + paramString + '"');
				}
			}
			if (!_.isArray(params)) {
				params = [params];
			}
		}
		return params;
	};

	var addValidationRule = function (object, ruleName, params, toStart) {
		ruleName = ruleName.trim();
		if (ruleName === 'required' || ruleName === 'optional') {
			if (object.validation.required !== VALIDATION_REQUIRED_DEFVAL) {
				throw new Error('required/optional rules conflict');
			}
			object.validation.required = ruleName === 'required';
		} else {
			object.validation.rules[toStart ? 'unshift' : 'push'](mkobj(ruleName, parseParamsJSON(params || null) || []));
		}
	};

	var hasValidationRule = function (object, ruleName) {
		return object.validation && _.any(object.validation.rules, function (rule) {
			return rule[ruleName] != null;
		});
	};

	var addFilter = function (object, toEnd, name, params) {
		object.filters[toEnd ? 'push' : 'unshift'](mkobj(name, params));
	};

	var parseTypedItemString = function (str) {
		var parsed = {}, range, min, max;
		str.replace(/^([a-zA-Z][a-zA-Z_0-9]*)(?:\:?([a-zA-Z0-9_]*))(?:\{?([^\}]*)\}?)(\|?.*)$/, function (word, nameString, typeString, rangeString, filtersString) {
			parsed.length = {};
			parsed.filters = [];
			parsed.validation = { required: VALIDATION_REQUIRED_DEFVAL, rules: [] };

			// name
			parsed.name = verifyStringName(nameString.trim());

			// type
			parsed.type = verifyStringName(typeString.trim() || options.defaultType);

			if (!_.contains(availableTypesNames, parsed.type)) {
				throw new Error('invalid type "' + typeString + '", must be [' + availableTypesNames.join(',') + ']');
			}

			// parse rage string
			rangeString = rangeString.replace(/\s*/g, '');
			if (rangeString) {
				range = rangeString.split(',');

				if (range.length === 1) {
					max = min = +range[0];
				} else if (range.length === 2) {
					min = range[0].length ? +range[0] : undefined;
					max = range[1].length ? +range[1] : undefined;
				}

				if (!range.length
						|| range.length > 2
						|| (max !== null && !_.isNumber(max))
						|| (min !== null && !_.isNumber(min))
						|| (/^[0-9]+,[0-9]+$/.test(rangeString) && min > max)
					) {
					throw new Error('invalid range format in item string "' + str + '" {' + rangeString + '}');
				}
				parsed.length.min = min;
				parsed.length.max = max;
			}

			// parse filters string
			var FILTER_FORMAT_EXP = /^([a-zA-Z_]+)(.*)$/i;
			if (filtersString) {
				var filterSegments = filtersString.replace(/^\|/, '').split(/\s*\|\s*/g);
				parsed.filters = _.map(filterSegments, function (part) {
					var name = part.replace(FILTER_FORMAT_EXP, '$1');
					var params = parseParamsJSON(part.replace(FILTER_FORMAT_EXP, '$2'));
					return mkobj(name, params);
				});
			}
		});

		if (_.isEmpty(parsed)){
			throw new Error('has invalid format');
		}

		return parsed;
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
					if (directiveValue.length < 2) {
						throw new Error('must have >= 2 items [' + directiveValue.join(',') + ']');
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
				data: {},
				meta: {},
				limit: limit || null
			};

			_.each(['data', 'meta'], function (name) {
				this._reqParseItems(response.output[name], directiveData[name]);
			}, this);

			return response;
		},

		_reqParseItems: function (result, items) {
			_.each(items, function (optionName, optionValue) {
				if (!_.isArray(items)) {
					var _optionName = optionName;
					optionName = optionValue;
					optionValue = _optionName;
				}
				tryCascadeFuncCall(optionName, function () {
					var item = _.omit(parseTypedItemString(optionName), ['length']);

					if (!_.isEmpty(result[item.name])) {
						throw new Error('duplicate name "' + item.name + '"');
					}

					result[item.name] = item;
					if (_.contains(nestedTypesNames, item.type)) {
						result[item.name].nested = {};
						this._reqParseItems(result[item.name].nested, optionValue);
					}
				}, this)();
			}, this);
		}

	});

	directiveFactory.directive('request', {

		default: {},

		process: function (directive, directiveData, apiData) {

			var input = {
				file: false,
				params: {},
				query: {},
				body: {}
			};

			var categories = _.keys(input);

			_.each(directiveData, function (inputData, inputCategory) {
				if (!_.contains(categories, inputCategory)) {
					throw new Error('Undefined type "' + inputCategory + '"');
				}
				if (inputCategory === 'file') {
					if (!_.isBoolean(inputData)) {
						throw new Error('file type must be boolean');
					}
					input[inputCategory] = inputData;
				} else {
					this._reqInput(input[inputCategory], inputData);
				}
			}, this);

			return {
				input: input
			};
		},

		_reqInput: function (result, inputData) {
			_.each(inputData, function(optionData, optionName){
				var inputItem = parseTypedItemString(optionName);

				if (_.isEmpty(inputItem.name)) {
					throw new Error('undefined input item name');
				}

				tryCascadeFuncCall(inputItem.name, function () {
					optionData = _.isString(optionData) ? {validation: optionData.split(/\s*\|\s*/)} : optionData;
					optionData = _.isArray(optionData) ? {validation: optionData} : optionData;

					var available = { validation: [], nested: {}, filters: [], limit: null };
					var availableNames = _.keys(available);
					_.defaults(optionData, available);

					if (_.any(optionData, function (v, k) { return !_.contains(availableNames, k); })) {
						throw new Error('has invalid keys, must be [' + availableNames.join(',') + ']');
					}

					if (!_.isArray(optionData.validation)) {
						throw new Error('has invalid sting-array format');
					}

					var FORMAT_EXP = /^([a-z0-9_]+)(.*)$/i;
					_.each(optionData.validation, function(rule){
						addValidationRule(inputItem, rule.replace(FORMAT_EXP, '$1'), rule.replace(FORMAT_EXP, '$2'), false);
					});

					var typeOption = options.types[inputItem.type] || nestedTypes[inputItem.type];

					if (inputItem.length.min) {
						addValidationRule(inputItem, 'min_length', [inputItem.length.min], true);
					}

					if (inputItem.length.max) {
						addValidationRule(inputItem, 'max_length', [inputItem.length.max], true);
					}

					delete inputItem.length;

					applyTypeOptions(typeOption.filters.concat(optionData.filters), function (filterName, filterParams) {
						addFilter(inputItem, false, filterName, filterParams);
					});

					applyTypeOptions(typeOption.validation, function (ruleName, ruleParams) {
						!hasValidationRule(inputItem, ruleName) && addValidationRule(inputItem, ruleName, ruleParams, true);
					});

					if (!_.isEmpty(result[inputItem.name])) {
						throw new Error('duplicate item name "' + inputItem.name +'"');
					}

					result[inputItem.name] = inputItem;

					if (_.contains(nestedTypesNames, inputItem.type)) {
						console.log(11111, inputItem.name);
						if (_.isEmpty(optionData.nested)) {
							throw new Error('empty nested field of nested type');
						}
						if (nestedTypes[inputItem.type].limit) {
							result[inputItem.name].limit = optionData.limit == null ? null : optionData.limit;
						} else if (optionData.limit) {
							throw new Error('limit field is excess for type "' + inputItem.type + '"');
						}

						result[inputItem.name].nested = {};
						this._reqInput(result[inputItem.name].nested, optionData.nested);
					}
				}, this)();

			}, this);
		}
	});

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
					if (!(segments.length === 2 || segments.length === 1)) {
						throw new Error('has invalid format "' + route +'", must be "METHOD URI_PATTERN"');
					}
					route = {
						method: segments[0],
						url: segments[1] == null ? '' : segments[1]
					};
				}
				if (!METHODS_EXP.test(route.method)) {
					throw new Error('has invalid method name "' + route.method + '"');
				}
				if (route.url == null || (_.isEmpty(route.url) && !directives.routeRootUrl) ) {
					throw new Error('has empty url pattern');
				}
				route.method = route.method.toUpperCase();
				route.name = directives.name;

				if (directives.routeRootUrl != null) {
					if (directives.routeRootUrl && !/^\//.test(route.url)) {
						route.url = directives.routeRootUrl.replace(/\/$/, '') + '/' + route.url;
					}
					delete directives.routeRootUrl;
				}

				var requestParams = ((directives.request||{}).input||{}).params||{};

				var requestParamNames = _.keys(requestParams);
				var paramNames = [];
				route.url = route.url.replace(/\((.*?):([a-zA-Z0-9_]*)\)/g, function (word, pattern, name) {
					if (!requestParams[name]) {
						throw new Error('undefined input param "' + name + '" in request spec [' + requestParamNames.join(',') + '], invalid url pattern "' + route.url + '"');
					}

					if (!availableTypes[requestParams[name].type].routeMask) {
						throw new Error('invalid used type "' + requestParams[name].type +'" in request params. this type hasn\'t routeMask');
					}

					if (!pattern) {
						pattern = availableTypes[requestParams[name].type].routeMask;
					}

					paramNames.push(name);

					return '(' + pattern + ':' + name + ')';
				});

//				route.url = route.url.replace(options.router.arrayPattern, function (word, name) {
//					if (!requestParams[name]) {
//						throw new Error('undefined input param "' + name + '" in request spec [' + requestParamNames.join(',') + '], invalid url pattern "' + route.url + '"');
//					}
//
//					if (!availableTypes[requestParams[name].type].routeMask) {
//						throw new Error('invalid used type "' + requestParams[name].type +'" in request params. this type hasn\'t routeMask');
//					}
//				});

//				if (directives.routeUrlStrictTrailing != null) {
//					if (!directives.routeUrlStrictTrailing) {
//						route.url = route.url.replace(/\/?$/, '/?');
//					}
//					delete directives.routeUrlStrictTrailing;
//				}

				var diffNames = _.difference(requestParamNames, paramNames);
				if (diffNames.length) {
					throw new Error('conflict request/routes params [' + diffNames.join(',') +']');
				}

				return route;
			});
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
		mainActionDirectives.fpath = fpath;

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