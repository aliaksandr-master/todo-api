define(function(require, exports, module){
    "use strict";

    var Backbone = require("backbone");
    var _ = require("underscore");
	var request = require('lib/request');

	var myAjax = function (opt) {
		opt = _.clone(opt);
		var success  = opt.success,
			provider = opt.provider;

		delete opt.contentType;

		opt.success = function(resp){
			var data = resp.data;
			if(success){
				success.call(this, data);
			}
		};

		return request.load(opt.url, provider, opt, false);
	};

	var _ajax = Backbone.ajax;
	Backbone.ajax = function(opt){
		return opt.provider ? myAjax(opt) : _ajax.call(this, opt);
	};

	var _sync = Backbone.sync;
	Backbone.sync = function(method, model, opt){
		if(model.provider){
			opt.provider = model.provider;
		}else if(model.model && model.model.prototype.provider ){
			opt.provider = model.model.prototype.provider;
		}
		return _sync.call(this, method, model, opt);
	};

    return exports;
});