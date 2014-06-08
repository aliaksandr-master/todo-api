define(function(require){
	'use strict';

	var BaseCollection = require('record/base/collection');
	var CrmProjectModel = require('./model');

	var CrmProjectCollection = BaseCollection.extend({

		url: '/crm/project/',

		model: CrmProjectModel,

//		comparator: function (model) {
//			return model.get('sortOrder');
//		}

	});

	return CrmProjectCollection;

});