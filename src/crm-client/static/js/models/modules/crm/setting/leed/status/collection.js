define(function(require){
	'use strict';

	var BaseCollection = require('models/base/collection');
	var CrmSettingLeedTypeModel = require('./model');

	var CrmSettingLeedTypeCollection = BaseCollection.extend({

		url: '/crm/setting/leed/status/?_debug=debug',

		model: CrmSettingLeedTypeModel

	});

	return CrmSettingLeedTypeCollection;

});