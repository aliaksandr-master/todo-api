define(function(require){
	'use strict';

	var BaseCollection = require('models/base/collection');
	var CrmSettingLeedStatusModel = require('./model');

	var CrmSettingLeedStatusCollection = BaseCollection.extend({

		url: '/crm/setting/leed/type/',

		model: CrmSettingLeedStatusModel

	});

	return CrmSettingLeedStatusCollection;

});