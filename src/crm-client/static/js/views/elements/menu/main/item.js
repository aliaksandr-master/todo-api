define(function(require, exports, module){
	'use strict';

	var BaseView = require('views/base/view'),
		template = require('templates/elements/menu/main/item');

	require('css!styles/elements/menu/main/item');

	var MenuItemView = BaseView.extend({

		autoRender: false,

		noWrap: true,

		template: template

	});

	return MenuItemView;
});