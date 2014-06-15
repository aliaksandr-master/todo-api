define(function(require){
	'use strict';

	var BaseModel = require('models/base/model');

	var CrmProjectModel = BaseModel.extend({

		urlRoot: '/crm/project/',

		idAttribute: "id"

	});

	return CrmProjectModel;

});