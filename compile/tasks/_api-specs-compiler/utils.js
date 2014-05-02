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

	var nestedTypes = {
		object: {
			filters: [],
			limit: false
		},
		array: {
			filters: [],
			limit: true
		}
	};

	var nestedTypesNames = _.keys(nestedTypes);

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

	var addRule = function (object, ruleName, params, toStart) {
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
			obj[ruleName] = validationRuleParamsFormat(params);
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

	var checkType = function (typeString, defaultType, nestedTypes) {
		typeString = typeString || defaultType;
		var found = _.any(options.types, function (obj, typeName) {
			return typeString === typeName;
		});
		if (!found) {
			found = _.any(nestedTypes, function (typeName) {
				return typeString === typeName;
			});
		}
		if (!found) {
			throw new Error('has invalid format in type "'+typeString+'"');
		}
		return typeString;
	};

	var addFilter = function (object, toEnd, name, params) {
		if (!object.filters) {
			object.filters = [];
		}
		var obj = {};
		obj[name] = params || [];
		toEnd ? object.filters.push(obj) : object.filters.unshift(obj);
	};

	var parseTypedItemString = function (str) {
		var parsed = {};
		str.replace(/^([a-zA-Z][a-zA-Z_0-9]*)(?:\:?([a-zA-Z0-9_]*))(?:\{?([^\}]*)\}?)(\|?.*)$/, function (word, name, type, rangeString, filters) {
			type = checkType(type, 'string', nestedTypesNames);

			var range, min, max;

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
			}

			parsed = {
				name: name,
				type: type,
				length: {
					min: min,
					max: max
				},
				filters: parseFilter(filters)
			};
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
		check: function (directive) {
			return (/^request/).test(directive);
		},
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
						addRule(inputItem, rule.replace(FORMAT_EXP, '$1'), rule.replace(FORMAT_EXP, '$2'), false);
					});

					var typeOption = options.types[inputItem.type] || nestedTypes[inputItem.type];

					if (inputItem.length.min) {
						addRule(inputItem, 'min_length', [inputItem.length.min], true);
					}

					if (inputItem.length.max) {
						addRule(inputItem, 'max_length', [inputItem.length.max], true);
					}

					delete inputItem.length;

					applyTypeOptions(typeOption.filters.concat(optionData.filters), function (filterName, filterParams) {
						addFilter(inputItem, false, filterName, filterParams);
					});

					applyTypeOptions(typeOption.rules, function (ruleName, ruleParams) {
						!hasRule(inputItem, ruleName) && addRule(inputItem, ruleName, ruleParams, true);
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