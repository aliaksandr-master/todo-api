define(function(require, exports, module){
	'use strict';

	var BaseController = require('controllers/base/controller');
	var SettingLeedCollection = require('models/modules/crm/setting/leed/status/collection');
	var SettingLeedStatusesView = require('views/modules/crm/setting/leed/status/statuses/statuses');

	var SettingLeedStatusController = BaseController.extend({

		show: function () {
			var that = this;
			that.settingLeedCollection = new SettingLeedCollection();
			that.settingLeedCollection.fetch().then(function () {
				that.settingLeedView = new SettingLeedStatusesView({
					collection: that.settingLeedCollection,
					region: "layout/content"
				});
			});
		}

	});

	return SettingLeedStatusController;
});