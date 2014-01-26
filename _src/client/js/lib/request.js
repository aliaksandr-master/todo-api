define(function(require, exports, module){
    "use strict";

	var apiProvider = require('lib/providers/api');
	var $ = require('jquery');
	var _ = require('underscore');
	var utils = require('lib/utils');

	var providers = {
		api: apiProvider
	};

	var Request = function Request () {

	};

	Request.prototype = {

		Request: Request,

		load: function(url, provider, opt, isSync){
			if (_.isBoolean(opt)) {
				isSync = opt;
				opt = {};
			}

			if (_.isString(opt)) {
				opt = {
					dataType: opt
				};
			}

			opt = opt || {};
			if (_.isObject(provider)) {
				opt = provider;
				provider = opt.provider;
			} else if (_.isBoolean(provider)) {
				isSync = provider;
				provider = null;
			}

			opt = _.clone(opt);

			provider = provider || opt.provider;
			delete opt.provider;

			opt.url = url;

			opt.async = !isSync;

			var deferred = provider ? providers[provider].ajax(opt) : $.ajax(opt);

			utils.showPreloader();
			deferred.always(function () {
				utils.hidePreloader();
			});

			return deferred;
		}

	};

	exports = new Request();

    return exports;
});