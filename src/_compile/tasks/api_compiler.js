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
		destSourceJsonFile: 'api/var/api.source.json',
		destParsedJsonFile: 'api/var/api.parsed.json'
	};

	var OPTIONS            = 'options',

		API_NAME           = 'api_name',
		API_ROOT           = 'api_root',

		DIRECTIVES_EXP     = /^(response|filters|request|access)[:]?(.+)?$/,
		CELL_NAME          = 'id',
		URL                = 'url',
		URL_PARAMS         = 'params',
		ARGUMENTS_COUNT    = 'params_count',
		FILTERS            = 'filters',
		RESPONSE           = 'response',
		RESPONSE_TYPE      = "response_type",
		ACCESS             = 'access',
		REQUEST            = 'request',
		REQUEST_METHOD     = "method",

		RESPONSE_TYPES_EXP = /^(item|array)$/,
		RESPONSE_TYPE_ONE  = 'item',
		RESPONSE_TYPE_MANY = 'array',

		TYPES_EXP          = /^(array|object|number|string|integer|float|boolean|bool)$/i,
		DEFAULT_TYPE       = 'string';

	options.cwd = options.cwd.replace(/[\\\/]*$/, '/');

	var parseOptionWithType = function (option) {
		var opt = option.split(/\s*:\s*/);
		opt[1] = opt[1] ? opt[1] : DEFAULT_TYPE;
		if(TYPES_EXP.test(opt[1])){
			return {
				name: opt[0],
				type: opt[1]
			};
		}
		return null;
	};

	var makeCellName = function(method, url1, argsCount){
		var url = url1.replace(/\$[^\/]+/g, '%1');
		return method + " " + url + " (" + argsCount + ")";
	};

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

	var compile = function(source){
		var resultApi = {};
		_.each(source, function(apiData, apiName){
			var errPref = '"'+apiName+'": ';
			var _urlParams = {};
			var filterParams = {};
			var requestParams = {};
			var accessParams = {
				need_login: false,
				only_owner: false,
				access_name: false
			};
			var responseParams = {};
			var responseType = RESPONSE_TYPE_MANY;

			_.each(apiData, function(options, directive){
				var name = directive.replace(DIRECTIVES_EXP, '$1');
				var type = directive.replace(DIRECTIVES_EXP, '$2');

				if(name){

					// ACCESS
					if(name === ACCESS){
						_.extend(accessParams, options);
					}

					// REQUEST
					if(name === REQUEST){
						_.each(options, function (option, optionName) {
							var opt = parseOptionWithType(optionName);
							if (!opt) {
								grunt.fail.warn(errPref+'Invalid type of param "' + optionName + '", available ' + TYPES_EXP.toString());
								return;
							}
							opt['validation'] = parseValidation(option);
							if(opt['validation']['required']){
								delete opt['validation']['optional'];
							}else if(!opt['validation']['optional']){
								opt['validation']['required'] = validationRule('required', 'required', '');
							}
							if(/integer|number/.test(opt['type'])){
								opt['validation']['decimal'] = validationRule('decimal', 'decimal', '');
							}
							if (/^\$/.test(opt.name)) {
								opt.param = opt.name;
								opt.name  = opt.param.replace(/^\$/, '');
								_urlParams[apiName.indexOf("$" + opt.name)] = opt;
							} else {
								requestParams[opt.name] = opt;
							}
						});
					}

					if(name === RESPONSE){
						if (!type) {
							responseType = RESPONSE_TYPE_ONE;
						} else if (RESPONSE_TYPES_EXP.test(type)) {
							responseType = type;
						} else {
							grunt.fail.warn(errPref + 'Invalid format of response type, available ' + RESPONSE_TYPES_EXP.toString());
							return;
						}
						_.each(options, function(option){
							var opt = parseOptionWithType(option);
							if(opt){
								responseParams[opt.name] = opt;
							}else{
								grunt.fail.warn(errPref + 'Invalid type of response param "' + option + '", available: '+TYPES_EXP.toString());
							}
						});
					}

					if(name === FILTERS){
						_.each(options, function(option, optionName){
							var opt = parseOptionWithType(optionName);
							if(opt){
								filterParams[optionName] = opt;
							}else{
								grunt.fail.warn(errPref + 'Invalid type of filter param "' + option + '", available: '+TYPES_EXP.toString());
							}
						});
					}
				}
			});

			// VALID URL PARAMS SEQUENCE
			var urlParams = [];
			_.each(_urlParams, function(opt){
				opt["index"] = urlParams.length;
				urlParams.push(opt);
			});

			// METHOD
			var method = apiName.replace(/^([A-Z]+)\s+(.+)$/, "$1");

			// REQUEST_URI
			var url = apiName.replace(/^([A-Z]+)\s+(.+)$/, "$2");

			// RESULT
			var api = {};
			api[URL] = url;
			api[ARGUMENTS_COUNT ] = urlParams.length;
			api[REQUEST_METHOD] = method;
			api[URL_PARAMS] = urlParams;
			api[FILTERS] = filterParams;
			api[REQUEST] = requestParams;
			api[RESPONSE_TYPE] = responseType;
			api[RESPONSE] = responseParams;
			api[ACCESS] = accessParams;
			api[API_NAME] = apiName;
			api[CELL_NAME] = makeCellName(method, url, urlParams.length);

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