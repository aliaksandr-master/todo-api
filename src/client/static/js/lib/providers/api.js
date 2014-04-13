define(function(require, exports, module){
	"use strict";

	var _ = require('underscore');
	var Chaplin = require('chaplin');
	var utils = require('lib/utils');
	var BaseProvider = require('lib/providers/base/provider');

	var ApiProvider = BaseProvider.extend({

		version: null,

		base: 'api/',

		defaultParams: {
			dataType: 'json',
			contentType: 'json'
		},

		prepareResponse: function(resp, options){
			resp = ApiProvider.__super__.prepareResponse.apply(this, arguments);
			if (!resp) {
				return null;
			}
			return {
				status: resp.status,
				meta: resp.meta,
				data: resp.data
			};
		},

		prepareParams: function (opt) {
			var that = this;
			opt = ApiProvider.__super__.prepareParams.apply(this, arguments);
			if (opt.contentType === 'json' && _.isObject(opt.data)) {
				opt.data = JSON.stringify(opt.data);
			}
			var _error = opt.error;
			opt.error = function(jqXHR, textStatus, errorThrown){
				var standard = true;
				var resp = that.prepareResponse(jqXHR.responseText, opt);
				if (_error) {
					standard = false === _error.call(this, jqXHR, textStatus, errorThrown);
				}
				if (standard && (jqXHR.status === 401 || resp.status === 401)) {
					Chaplin.utils.redirectTo('login');
				}
			};
			return opt;
		}
	});


	return ApiProvider;
});