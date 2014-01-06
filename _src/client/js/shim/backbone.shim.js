define(function(require, exports, module){
    "use strict";



    var Backbone = require("backbone");
    var $ = require("jquery");
    var _ = require("underscore");
	var ajax = Backbone.ajax;

	var myAjax = function (opt) {
		opt = _.clone(opt);
		var success  = opt.success,
			error  = opt.error,
			modelName = opt.modelName,
			sendData = opt.data;

		delete opt.contentType;
		delete opt.emulateHTTP;
		delete opt.emulateJSON;
		delete opt.modelName;
		delete opt.storeName;
		delete opt.parse;

		opt.success = function(resp){
			var data = resp.data;
			console.log(opt.type, "'"+modelName+"'", opt.url, sendData, " ===> data:", data, ", error:", resp.error);
			if(success){
				return success.call(this, data);
			}
		};

		opt.error = function(){
			console.error(opt.type, "'"+modelName+"'", opt.url, sendData);
			if(error){
				return error.apply(this, arguments);
			}
		};
		opt.data = /POST|PUT/.test(opt.type) ? $.param([{name: "json",value: sendData}]) : undefined;
		return $.ajax(opt);
	};

	Backbone.ajax = function(opt){
		return opt.modelName ? myAjax(opt) : ajax.call(this, opt);
	};

	var sync = Backbone.sync;
	Backbone.sync = function(method, model, opt){
		if(model.modelName){
			opt.modelName = model.modelName;
		}else if(model.model && model.model.prototype.modelName ){
			opt.modelName = model.model.prototype.modelName;
		}
		return sync.call(this, method, model, opt);
	};

    return exports;
});