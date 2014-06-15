define(function(require, exports, module){
	'use strict';

	var BaseView = require('views/base/view'),
		template = require('templates/modules/crm/setting/leed/type/types/type');

	require('css!styles/modules/crm/setting/leed/type/types/type');

	var SettingLeedTypeItemView = BaseView.extend({

		tagName: 'tr',

		autoRender: false,

		noWrap: false,

		template: template

	});

	return SettingLeedTypeItemView;
});