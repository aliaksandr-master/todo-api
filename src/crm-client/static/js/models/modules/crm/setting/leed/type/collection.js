define(function(require){
	'use strict';

	var BaseCollection = require('models/base/collection');
	var CrmSettingLeedTypeModel = require('./model');

	var CrmSettingLeedTypeCollection = BaseCollection.extend({

		url: '/crm/setting/leed/type/',

		model: CrmSettingLeedTypeModel

	});

	return CrmSettingLeedTypeCollection;

});