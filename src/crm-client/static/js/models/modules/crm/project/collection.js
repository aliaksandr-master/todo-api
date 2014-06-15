define(function(require){
	'use strict';

	var BaseCollection = require('models/base/collection');
	var CrmProjectModel = require('./model');

	var CrmProjectCollection = BaseCollection.extend({

		url: '/crm/project/',

		model: CrmProjectModel

	});

	return CrmProjectCollection;

});