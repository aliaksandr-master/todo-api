define(function(require, exports, module){
    "use strict";



    var Backbone = require("backbone");

	var ajax = Backbone.ajax;
	Backbone.ajax = function(options){
		var Server = options.server;
		if(Server){
			console.log(Server);
			delete options.server;
		}
		ajax.apply(this, arguments);
	};

	var sync = Backbone.sync;
	Backbone.sync = function(method, model, options){
		if(model.server){
			options.server = model.server;
		}
		sync.apply(this, arguments);
	};

    return exports;
});