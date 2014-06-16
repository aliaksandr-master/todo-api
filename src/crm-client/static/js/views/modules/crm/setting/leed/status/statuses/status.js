define(function(require, exports, module){
	'use strict';

	var BaseView = require('views/base/view'),
		template = require('templates/modules/crm/setting/leed/status/statuses/status');

	require('css!styles/modules/crm/setting/leed/status/statuses/status');

	var SettingLeedStatusItemView = BaseView.extend({

		tagName: 'tr',

		autoRender: false,

		noWrap: false,

		template: template

	});

	return SettingLeedStatusItemView;
});