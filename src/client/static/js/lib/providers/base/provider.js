define(function(require, exports, module){
	"use strict";

	var _ = require('underscore');
	var $ = require('jquery');
	var Chaplin = require('chaplin');
	var utils = require('lib/utils');

	var Provider = utils.BackboneClass({

		initialize: function () {
			var that = this;
			var defaultParamsArr = Chaplin.utils.getAllPropertyVersions(this, "defaultParams");
			_.each(defaultParamsArr, function (v) {
				_.extend(that.defaultParams, v);
			});
		},

		version: null,

		base: null,

		preloaded: true,

		defaultParams: {
			async: true,
			global: false,
			ifModified: false,
			dataType: 'json',
			contentType: 'json',
			timeout: 60
		},

		makeUrl: function (url) {
			return utils.makePath(utils.concatPaths(this.base, this.version, url));
		},

		prepareResponse: function (resp, opt) {
			if (opt === 'json'){
				if (_.isString(resp)) {
					try {
						resp = JSON.parse(resp);
					} catch (_e) {}
				}
				if (!_.isObject(resp)) {
					return null;
				}
			}
			return resp;
		},

		prepareParams: function (opt) {
			opt = _.extend({}, this.defaultParams, opt);
			opt.url = this.makeUrl(opt.url);
			opt.dataType = opt.dataType || this.dataType;
			return opt;
		},

		request: function (opt) {
			var that = this;

			opt = this.prepareParams(opt);

			var _success = opt.success;
			var _error = opt.error;

			opt.success = function (resp, textStatus, jqXHR) {
				resp = that.prepareResponse(resp, opt);
				if (resp === null) {
					if (_error) {
						_error.call(this, jqXHR, textStatus);
					}
				} else {
					if (_success) {
						_success.call(this, resp);
					}
				}
			};

			opt.error = function (jqXHR, textStatus, errorThrown) {
				if (_error) {
					_error.call(this, jqXHR, textStatus, errorThrown);
				}
			};

			return $.ajax(opt);
		}
	});

	return Provider;
});