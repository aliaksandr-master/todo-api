"use strict";

var _ = require('lodash');

module.exports = function (options) {

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
		return category === '$' ? 'args' : (category === '?' ? 'query' : 'body');
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

	var parseNestedTypes = {

	};

	var ApiDirective = function (name, obj) {
		this.name = name;
		this.need = false;
		this.inherit = false;
		this.default = undefined;
		_.extend(this, obj);
	};
	ApiDirective.prototype = {
		verify: function (directive, directiveData, apiName) {
		},
		check: function (directive) {
			return this.name === directive;
		},
		process: function (directive, directiveData, apiName) {
			return directiveData;
		},
		tryThis: function (apiDataKeys, apiName, apiData, _opts) {
			if (apiData[this.name] === undefined) {
				apiData[this.name] = _.cloneDeep(this.default);
			}
			var directiveFromOpts = null;
			var directiveFromData = null;
			_.each(apiDataKeys, function (key) {
				if (this.check(key)) {
					this.verify();

					if (_.isNull(directiveFromOpts) && _opts[key]) {
						directiveFromOpts = key;
					} else if (_.isNull(directiveFromData)) {
						directiveFromData = key;
					} else {
						throw new Error(apiName + ': must have one directive "' + this.name + '"');
					}
				}
			}, this);
			var directive = directiveFromData || directiveFromOpts;
			if (directive !== null) {
				var _obj = apiData[directive];
				delete apiData[directive];
				apiData[this.name] = this.process(directive, _obj, apiName, apiData);
			}
		}
	};

	var customDirectives = [];

	customDirectives.push(new ApiDirective('status', {
		need: true,
		inherit: function (opts, data) {
			return (opts == null ? [] : opts).concat(data == null ? [] : data);
		}
	}));

	customDirectives.push(new ApiDirective('response', {
		default: {},
		check: function (directive) {
			return (/^response/).test(directive);
		},
		process: function (directive, _options, apiName) {
			var response = null;
			directive.replace(/^response(?:\s*<\s*([1-9][0-9]*))?$/, function (word, limit) {
				response = {
					type: limit ? 'many' : 'one',
					limit: limit ? +limit : undefined
				};
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
		}
	}));

	customDirectives.push(new ApiDirective('request', {
		default: {},
		check: function (directive) {
			return (/^request/).test(directive);
		},
		process: function (directive, _options, apiName) {
			var input = _.map(_options, function(optionData, optionName){
				if (_.isObject(optionData)){
					optionName += optionData.filters ? '|' + optionData.join('|') : '';
					optionData = optionData.rules || '';
				}

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
			});


			input = _.groupBy(input, 'category');
			var _requestInput = {
				args: {},
				query: {},
				body: {}
			};
			_.each(input, function (params, type) {
				_requestInput[type] = {};
				_.each(params, function (param) {
					_requestInput[type][param.name] = _.omit(param, 'category');
				});
			});

			return {
				input: _requestInput
			};
		}
	}));

	var compile = function (sourceJSON, fpath) {
		var resultApi = {};

		var data = {};
		var opts = {};

		_.each(sourceJSON, function (v, k) {
			if (/^>.+/.test(k)) {
				data[k] = v;
			} else {
				opts[k] = v;
			}
		});

		var controllerName = fpath.replace(/^.+\/([^\.]+)\.spec\.js$/, '$1');

		controllerName = opts.controller || controllerName;

		_.each(data, function (apiData, apiName) {
			var action = apiName.replace(/^>\s+/, '');
			apiName = controllerName + '.' + action;

			apiData.controller = controllerName;
			apiData.action = action;
			apiData.name = apiName;
			apiData.title = apiName;

			var _opts = _.cloneDeep(opts);
			apiData = _.merge(_opts, apiData);
			var apiDataKeys = _.keys(apiData);

			_.each(customDirectives, function (customDirective) {
				customDirective.tryThis(apiDataKeys, apiName, apiData, _opts);
			});

			// RESULT
			resultApi[apiData.name] = apiData;
		});
		return resultApi;
	};

	utils = {
		compile: compile,
		parse: {
			paramDirective: parseParamDirective,
			filter: parseFilter,
			params: parseParams,
			varParam: parseVarParam,
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
		addFilter: addFilter
	};

	return utils;

};