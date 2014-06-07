define(function(require, exports, module){
	"use strict";

	var _ = require('underscore');
	var $ = require('jquery');
	var Chaplin = require('chaplin');
	var utils = require('lib/utils');

	var ONE_DAY = 86400000;
	var MAX_CACHE_TIME = ONE_DAY;

	var cached = {};
	var deferreds = {};

	var Provider = utils.BackboneClass({

		initialize: function () {
			this.cached = {};
			this.deferreds = {};
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
//			global: false,
//			ifModified: false,
			dataType: 'json'
//			contentType: 'json',
//			timeout: 6000
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
			opt = _.extend({
				type: 'GET',
				cache: 3000
			}, this.defaultParams, opt);
			opt.url = this.makeUrl(opt.url);
			opt.dataType = opt.dataType || this.dataType;
			opt.type = opt.type.toUpperCase();
			return opt;
		},

		request: function (opt) {

			opt = this.prepareParams(opt);

			var that = this;
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

			var deferred;
			if (opt.cache && opt.type === 'GET') {
				var timestamp = Date.now();

				if (_.isObject(opt.cache)) {
					opt.cache = _.clone(opt.cache);
					opt.cache.time = _.isNumber(opt.cache.time) ? Math.abs(opt.cache.time) : ONE_DAY;
				} else {
					opt.cache = {
						time: _.isNumber(opt.cache) ? Math.abs(opt.cache) : ONE_DAY,
						clear: false,
						storage: false
					};
				}

				opt.cache.time = opt.cache.time > MAX_CACHE_TIME ? MAX_CACHE_TIME : opt.cache.time;

				opt.$$cacheKey$$ = this.getCacheKey(opt);

				if (opt.cache.clear || cached[opt.$$cacheKey$$] && opt.cache.time < (timestamp - cached[opt.$$cacheKey$$].timestamp)) {
					delete cached[opt.$$cacheKey$$];
				}

				if (cached[opt.$$cacheKey$$]) {
					deferred = cached[opt.$$cacheKey$$].deferred;
					deferred.then(opt.success, opt.error, opt.complete || function(){});
				} else {
					delete opt.cache;
					cached[opt.$$cacheKey$$] = {
						timestamp: timestamp,
						deferred: this.ajax(opt)
					};
					deferred = cached[opt.$$cacheKey$$].deferred;
				}
			}

			if (opt.type === 'GET' && !opt.$$cacheKey$$) {
				opt.$$cacheKey$$ = this.getCacheKey(opt);
				if (deferreds[opt.$$cacheKey$$]) {
					return deferreds[opt.$$cacheKey$$].then(opt.success, opt.error, opt.complete || function () {});
				}
				deferred = deferreds[opt.$$cacheKey$$] = $.ajax(opt).always(function(){
					delete deferreds[opt.$$cacheKey$$];
				});
			}

			return deferred || this.ajax(opt);
		},

		getCacheKey: function (opt) {
			return JSON.stringify(opt.data) + opt.url + opt.type;
		},

		ajax: function (opt) {
			return $.ajax(opt);
		}
	});

	return Provider;
});