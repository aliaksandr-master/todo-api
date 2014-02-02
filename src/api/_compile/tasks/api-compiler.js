"use strict";
module.exports = function(grunt){

	var _ = require('underscore');

	var options = {
		cwd: 'src/api/definition/',
		src: [
			'*.json',
			'**/*.json'
		],
		jsonSpaces: 4,
		apiRoot: '/api',
		destSourceJsonFile: 'build/api/var/api.source.json',
		destParsedJsonFile: 'build/api/var/api.parsed.json'
	};

	var OPTIONS            = 'options',

		API_NAME           = 'api_name',
		API_VERSION        = 'api_version',
		API_ROOT           = 'api_root',

		NAME_DIRECTIVE_EXP = /^name$/,
		ACCESS_DIRECTIVE_EXP = /^access$/,

		CELL_NAME          = 'id',
		URL                = 'url',
		ARGUMENTS_COUNT    = 'params_count',
		RESPONSE           = 'response',
		ACCESS             = 'access',
		REQUEST            = 'request',
		REQUEST_METHOD     = "method",

		RESPONSE_TYPE_ONE  = 'one',
		RESPONSE_TYPE_MANY = 'many',

		TYPES_EXP          = /^(?:text|string|integer|decimal|float|boolean)$/i,
		DEFAULT_TYPE       = 'string';

	options.cwd = options.cwd.replace(/[\\\/]*$/, '/');


	var VALIDATION_PARAM_EXP = /^([a-z0-9_]+)(.*)$/i;
	var validationRule = function (source, ruleName, _paramsJson) {
		_paramsJson = (_paramsJson || "").replace(/'/g, '"');
		return {
			source: source,
			name: ruleName.trim(),
			method: '_rule__' + ruleName.trim(),
			params: _paramsJson ? JSON.parse(_paramsJson, true) : {}
		};
	};
	var parseValidation = function (option){
		if (typeof option === 'string') {
			option = option.split(/\s*\|\s*/);
		}
		var opt = {};
		_.each(option, function(rule){
			var ruleName    = rule.replace(VALIDATION_PARAM_EXP, '$1');
			var _paramsJson = rule.replace(VALIDATION_PARAM_EXP, '$2');
			opt[ruleName] = validationRule(rule, ruleName, _paramsJson);
		});
		return opt;
	};

	var parseRequestOption = function (optionData, optionName, apiName) {

		var result;

		optionName.replace(/^([@>$]?)([\w][\w\d]*)(?:\:[\w]+)?(?:\{([^\}]+)\})?(#[^#\*]+)*(\*[^#\*]+)*$/, function(word, category, name, type, len, beforeFilters, afterFilters){

			type = type || DEFAULT_TYPE;

			if (!TYPES_EXP.test(type)) {
				throw new Error('"'+optionName+'" has invalid format in Type "'+type+'"');
			}

			var minLength = null;
			var maxLength = type == 'string' ? 255 : null;

			if (len) {
				var _len = len.split(/\s*,\s*/);
				if (_len.length > 2 || !_len.length || /^[0-9,]+$/.test(len)) {
					throw new Error ('"'+optionName+'" has invalid format in Range "{'+len+'}"');
				}
				minLength = _len[0];
				maxLength = _len[1];
				if (len.length == 1) {
					maxLength = _len[0];
				}
				if (minLength > maxLength) {
					throw new Error ('"' + optionName + '" has invalid format in Range "{' + len + '}"');
				}
			}

			if (beforeFilters) {
				beforeFilters = beforeFilters.replace(/^#/,'');
				var _beforeFilters = [];
				_.each(beforeFilters.split('#'), function (v) {
					var params = v.replace(/^([\w\d]+)(.+)$/i, '$2').replace(/'/g, '"');
					if (params) {
						try {
							params = JSON.parse(params);
						} catch (e) {
							throw new Error('"'+optionName+'" has invalid JSON format in beforeFilters params');
						}
					}
					_beforeFilters.push({
						name: v.replace(/^([\w\d]+)(.+)$/i, '$1'),
						params: params
					})
				});
				beforeFilters = _beforeFilters;
			}

			if (afterFilters){
				afterFilters = afterFilters.replace(/^\*/,'');
				var _afterFilters = [];
				_.each(afterFilters.split('*'), function (v) {
					var params = v.replace(/^([\w\d]+)(.+)$/i, '$2').replace(/'/g, '"');
					if (params) {
						try {
							params = JSON.parse(params);
						} catch (e) {
							throw new Error('"'+optionName+'" has invalid JSON format in beforeFilters params');
						}
					}
					_beforeFilters.push({
						name: v.replace(/^([\w\d]+)(.+)$/i, '$1'),
						params: params
					})
				});
				afterFilters = _afterFilters;
			}

			result = {
				category: category == '$' ? 'URL' : (category == '@' ? 'QUERY' : 'INPUT'),
				name: name,
				type: type,
				min_length: minLength,
				max_length: maxLength,
				beforeFilters: beforeFilters || [],
				afterFilters: afterFilters || []
			};

			return '';
		});

		if (!result) {
			throw new Error(apiName + ': has invalid format');
			return null;
		}

		result.validation = parseValidation(optionData);
		if (result.validation.required) {
			delete result.validation.optional;
		} else if (!result.validation.optional) {
			result.validation.required = validationRule('required', 'required', '');
		}
		if (result.type == 'string') {
			result.beforeFilters.unshift('trim');
			result.beforeFilters.unshift('xss');
		}
		if (result.min_length) {
			result.validation.min_length = validationRule('min_length', 'min_length', '[' + result.min_length + ']');
		}
		if (result.max_length) {
			result.validation.max_length = validationRule('max_length', 'max_length', '[' + result.max_length + ']');
		}
		if (result.type == 'decimal') {
			result.validation.decimal = validationRule('decimal', 'decimal', '');
		}
		if (result.type == 'integer') {
			result.validation.integer = validationRule('integer', 'integer', '');
		}
		if (result.type == 'float') {
			result.validation.float = validationRule('float', 'float', '');
		}
		if (result.category == 'URL') {
			result.url_index = apiName.indexOf("$" + result.name);
			if(result.url_index < 0 ) {
				throw new Error('"'+optionName+'" has invalid URL param. param "'+result.name+'" is not attach in url string "'+optionName+'"');
			}
		}
		delete result.min_length;
		delete result.max_length;
		return result;
	};

	var makeCellName = function(method, url1, argsCount){
		var url = url1.replace(/\$[^\/]+/g, '%1');
		return method + " " + url + " (" + argsCount + ")";
	};

	var compile = function(source){
		var resultApi = {};
		_.each(source, function(apiData, apiName){
			var title = apiName;
			var request = {};
			var response = {};
			var access = {
				need_login: false,
				only_owner: false
			};
			_.each(apiData, function(options, directive){
				var result;

				// ACCESS
				if(ACCESS_DIRECTIVE_EXP.test(directive)){
					_.extend(access, options);
				}

				// NAME
				if(NAME_DIRECTIVE_EXP.test(directive)){
					title = options;
				}

				// REQUEST
				if (/^request/.test(directive)) {
					request.input = _.map(options, function(option, optionName){
						if (_.isObject(option)){
							optionName += option.before ? '#'+option.before.join('#') : '';
							optionName += option.after ? '*'+option.after.join('*') : '';
							option = option.rules;
						}
						return parseRequestOption(option, optionName, apiName);
					});
				}

				// RESPONSE
				if (/^response/.test(directive)) {
					directive.replace(/^response[:]?(?:(one|many)\s*\(([^\)]+)\)\s*)?$/, function (word, type, params) {

						response.type = type || RESPONSE_TYPE_ONE;

						if(params){
							response.pagenator = {};
							params.replace(/^\s*\{([^\}]+)\}\s*([^\s]*)\s*$/, function(word, limits, pageNumber){
								var category;
								if (pageNumber) {
									if (/^[0-9]$/.test(pageNumber)) {
										response.pagenator.page_number = pageNumber;
									} else if (/^[$@>]?[a-zA-Z_0-9]+$/.test(pageNumber)) {
										response.pagenator.page_param_name = pageNumber.replace(/^[$@>]/, '');
										category = pageNumber.replace(/^([$@>])(.+)$/, '$1');
										response.pagenator.page_param_category = category == '$' ? 'URL' : (category == '@' ? 'QUERY' : 'INPUT');
									} else {
										throw new Error(apiName + ': Invalid type of response "'+params+'" param PAGE_NUMBER');
									}
								}

								var LIMIT_EXP = /^\s*([$@>]?)([a-zA-Z][a-zA-Z0-9_]*)(?:\s*,\s*([1-9][0-9]*))?\s*$/;
								if (LIMIT_EXP.test(limits)) {
									response.pagenator.limit_param_name = limits.replace(LIMIT_EXP, '$2');
									category = limits.replace(LIMIT_EXP, '$1');
									response.pagenator.limit_param_category = category == '$' ? 'URL' : (category == '@' ? 'QUERY' : 'INPUT');
									response.pagenator.max_limit = limits.replace(LIMIT_EXP, '$3') || 255;
								} else if (/^\s*([1-9][0-9]*)\s*$/.test(limits)) {
									response.pagenator.max_limit = limits.replace(/^\s*([0-9]+)\s*$/, '$1') || 255;
								} else {
									throw new Error(apiName + ': Invalid type of response LIMITS "' + limits +'" in response params"' + params + '"');
								}
								return '';
							});
							if (!response.pagenator) {
								throw new Error(apiName + ': has invalid format in response params "' + params + '"');
							}
						}
						return '';
					});

					if (!response){
						throw new Error(apiName + ': Invalid type of response param "'+directive+'" : \n'+JSON.stringify(options,null, 4));
					}

					response.output = {
						data: {},
						meta: {}
					};

					if (_.isArray(options)) {
						options = {
							data: options
						};
					}

					if (options.data) {
						_.each(options.data, function (option) {
							option = option.trim();
							var opt = option.split(/\s*:\s*/);
							var name = opt[0];
							var type = opt[1] || DEFAULT_TYPE;

							if (!TYPES_EXP.test(type)) {
								throw new Error(apiName + ': Invalid type of response data param "' + option + '", available: '+TYPES_EXP.toString());
							}

							if (!name || opt.length > 2) {
								throw new Error(apiName + ': Invalid response data param "' + option + '"');
							}
							response.output.data[name] = {
								type: type
							}
						});
					}

					if (options.meta) {
						_.each(options.meta, function (option) {
							option = option.trim();
							var opt = option.split(/\s*:\s*/);
							var name = opt[0];
							var type = opt[1] || DEFAULT_TYPE;
							response.output.meta[name] = {
								type: type
							};
							if (!TYPES_EXP.test(type)) {
								throw new Error(apiName + ': Invalid type of response meta param "' + option + '", available: '+TYPES_EXP.toString());
							}

							if (!name || opt.length > 2) {
								throw new Error(apiName + ': Invalid response meta param "' + option + '"');
							}
						});
					}
					if (!response.output.data && !response.output.meta){
						throw new Error(apiName + ': EMPTY response param ');
					}


				}
			});

			// REQUEST
			request.input = _.groupBy(request.input, 'category');
			var _requestInput = {};
			_.each(request.input, function (params, type) {
				_requestInput[type] = {};
				_.each(params, function (param) {
					_requestInput[type][param.name] = _.omit(param, 'category');
				});
			});
			request.input = _requestInput;

			if (request.input.URL) {
				request.input.URL = _.sortBy(request.input.URL, "url_index");
			}

			var hasError = false;
			if (response.paginator) {
				if (response.paginator.limit_param_category){
					if (!request.input[response.paginator.limit_param_category]){
						throw new Error('"' + apiName + '" :  hasn\'t input param of "' + response.paginator.limit_param_category + '" category for LIMIT param of RESPONSE;');
					}
					if (response.paginator.limit_param_category == 'URL') {
						hasError = !_.contains(_.pluck(request.input.URL, 'name'), response.paginator.limit_param_name);
					} else {
						hasError = !!request.input[response.paginator.limit_param_category] && !!request.input[response.paginator.limit_param_category][response.paginator.limit_param_name];
					}

					if (hasError) {
						throw new Error('"' + apiName + '" :  hasn\'t input param name "' + response.paginator.limit_param_name + '" of "' + response.paginator.limit_param_category + '" category for LIMIT param of RESPONSE;');
					}
				}
				hasError = false;
				if (response.paginator.page_param_category){
					if (!request.input[response.paginator.page_param_category]){
						throw new Error('"' + apiName + '" :  hasn\'t input param of "' + response.paginator.page_param_category+ '" category for PAGE_NUMBER param of RESPONSE;');
					}
					if (response.paginator.page_param_category == 'URL') {
						hasError = !_.contains(_.pluck(request.input.URL, 'name'), response.paginator.page_param_category);
					} else {
						hasError = !!request.input[response.paginator.page_param_category] && !!request.input[response.paginator.page_param_category][response.paginator.page_param_category];
					}
					if (hasError) {
						throw new Error('"' + apiName + '" :  hasn\'t input param name "' + response.paginator.page_param_name + '" of "' + response.paginator.page_param_category + '" category for LIMIT param of RESPONSE;');
					}
				}
			}

			// METHOD
			var method = apiName.replace(/^([A-Z]+)\s+(.+)$/, "$1");

			// REQUEST_URI
			var url = apiName.replace(/^([A-Z]+)\s+(.+)$/, "$2").split(' ')[0];
			var version = apiName.replace(/^([A-Z]+)\s+(.+)$/, "$2").split(' ')[1];

			// RESULT
			var api = {};
			api[URL] = url;
			api[ARGUMENTS_COUNT] = (request.input.URL || []).length;
			api[REQUEST_METHOD] = method;
			api[REQUEST] = request;
			api[RESPONSE] = response;
			api[ACCESS] = access;
			api[API_NAME] = apiName;
			api[API_VERSION] = version;
			api[CELL_NAME] = makeCellName(method, url, api[ARGUMENTS_COUNT]);
			resultApi[api[CELL_NAME]] = api;
		});
		return resultApi;
	};

	return function(){
		var fs = grunt.file.expand({cwd: options.cwd}, options.src);
		var source = {};

		_.each(fs, function(fpath){
			_.extend(source, grunt.file.readJSON(options.cwd + fpath));
		});

		// compile
		var parsed = compile(source);

		parsed[OPTIONS] = {};
		parsed[OPTIONS][API_ROOT] = options.apiRoot;

		grunt.file.write(options.destSourceJsonFile, JSON.stringify(source, null, options.jsonSpaces));
		grunt.file.write(options.destParsedJsonFile, JSON.stringify(parsed, null, options.jsonSpaces));

		grunt.log.ok('file ' + options.destSourceJsonFile,' was created');
		grunt.log.ok('file ' + options.destParsedJsonFile,' was created');
		grunt.log.ok('total: ' + _.keys(parsed).length + ' items');
	};

};