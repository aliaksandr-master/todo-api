define(function(require){
	'use strict';

	var BaseModel = require('record/base/model');

	var CrmProjectModel = BaseModel.extend({

		toJSON: function(){
			var model = this;
			var req = {};
			return req;
		},

		parse: function(response){
			var resp = {};
			return resp;
		},

		idAttribute: "id"

	});

	return CrmProjectModel;

});