define(function(require, exports, module){
    'use strict';

    var Backbone = require("backbone");
    var _ = require("underscore");
	var request = require('lib/request');

	var _ajax = Backbone.ajax;
	Backbone.ajax = function(opt){
		return opt.provider ? request.load(opt.url, opt.provider, opt, false) : _ajax.call(this, opt);
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