define(function(require, exports, module){
    "use strict";

	var _ = require('underscore');
	var $ = require('jquery');
	var Chaplin = require('chaplin');
	var utils = require('lib/utils');

	var config = {
		apiVersion: '',
		root: 'server/'
	};

    var Api = function ApiProvider () {

		this.rootUrl = utils.makePath(utils.concatPaths(config.root, this.apiVersion));

		this.dataType = 'json';
	};

	Api.prototype = {

		_prepareResponse: function(resp){
			if (_.isString(resp)) {
				try {
					resp = JSON.parse(resp);
				} catch (_e) {}
			}

			if (!_.isObject(resp)) {
				return null;
			}

			return {
				status: resp.status,
				meta: resp.meta,
				data: resp.data
			};

		},

		prepareOptions: function(opt){
			return _.extend({}, opt);
		},

		ajax: function (opt) {
			var that = this;

			opt = _.extend({
				async: true
			}, opt);

			var _success  = opt.success,
				_error    = opt.error;

			opt.url = utils.makePath(utils.concatPaths(this.rootUrl, opt.url));

			opt.dataType = opt.dataType || this.dataType;

			opt.success = function (resp) {
				resp = that._prepareResponse(resp);
				if (resp !== null) {
					if (_success) {
						_success.call(this, resp);
					}
				} else {
					if (_error) {
						_error.call(this, resp);
					}
				}
			};

			opt.error = function(jqXHR, textStatus, errorThrown){
				var resp = that._prepareResponse(jqXHR.responseText);
				if (resp !== null) {
					if (_error) {
						_error.call(this, jqXHR, textStatus, errorThrown);
					}
					if (jqXHR.status === 401 && !opt.silentErrorHandler) {
						Chaplin.utils.redirectTo({url: '/user/login/'});
					}
				} else {
					if (_error) {
						jqXHR.responseText = null;
						_error.call(this, jqXHR, textStatus, errorThrown);
					}
				}
			};

			console.log(opt);
			return $.ajax(opt);
		}

	};

    return new Api();
});