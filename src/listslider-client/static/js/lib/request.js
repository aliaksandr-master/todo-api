define(function(require, exports, module){
    'use strict';

	var ApiProvider  = require('lib/providers/api');
	var SelfProvider = require('lib/providers/self');

	var $ = require('jquery');
	var _ = require('underscore');
	var utils = require('lib/utils');

	var Request = utils.BackboneClass({

		providers: {},

		provider: function (name, Provider) {
			var provider = null;
			if (Provider) {
				provider = this.providers[name] = Provider;
			} else if (this.providers[name]){
				Provider = this.providers[name];
				provider = new Provider();
			}
			return provider;
		},

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

			var providerName = provider;
			var providerObj = this.provider(providerName);
			if (providerObj) {
				if (providerObj.preloaded) {
					utils.showPreloader();
				}
				return providerObj.request(opt).always(function () {
					if (providerObj.preloaded) {
						utils.hidePreloader();
					}
				});
			}
			throw new Error('provider "'+providerName+'" is undefined');
		}

	});

	var request = new Request();

	request.provider('api', ApiProvider);
	request.provider('self', SelfProvider);

    return request;
});