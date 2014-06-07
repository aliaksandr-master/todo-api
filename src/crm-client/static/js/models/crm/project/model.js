define(function(require){
	"use strict";

	var BaseModel = require('models/base/model');

	return BaseModel.extend({

		toJSON: function(){
			var model = this;
			var req = {};
			return req;
		},

		parse: function(response){
			var resp = {};
			return resp;
		},

		defaults: function(){

			return {
			};

		},

		idAttribute: "id"

	});

});