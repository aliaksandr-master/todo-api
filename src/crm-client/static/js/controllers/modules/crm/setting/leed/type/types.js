define(function(require, exports, module){
	'use strict';

	var BaseController = require('controllers/base/controller');
	var SsettingLeedTypeCollection = require('models/modules/crm/setting/leed/type/collection');
	var SettingLeedView = require('views/modules/crm/setting/leed/type/types/types');

	var SettingLeedTypeController = BaseController.extend({

		show: function () {
			var that = this;
			that.settingLeedTypeCollection = new SsettingLeedTypeCollection();
			that.settingLeedTypeCollection.fetch().then(function () {
				that.settingLeedView = new SettingLeedView({
					collection: that.settingLeedTypeCollection,
					region: "layout/content"
				});
			});
		}

	});

	return SettingLeedTypeController;
});