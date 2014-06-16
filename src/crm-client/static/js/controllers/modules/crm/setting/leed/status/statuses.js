define(function(require, exports, module){
	'use strict';

	var BaseController = require('controllers/base/controller');
	var SettingLeedStatusCollection = require('models/modules/crm/setting/leed/status/collection');
	var SettingLeedStatusesView = require('views/modules/crm/setting/leed/status/statuses/statuses');

	var SettingLeedStatusController = BaseController.extend({

		show: function () {
			var that = this;
			that.settingLeedStatusCollection = new SettingLeedStatusCollection();
			that.settingLeedStatusCollection.fetch().then(function () {
				that.settingLeedView = new SettingLeedStatusesView({
					collection: that.settingLeedStatusCollection,
					region: "layout/content"
				});
			});
		}

	});

	return SettingLeedStatusController;
});