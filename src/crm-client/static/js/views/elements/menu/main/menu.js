define(function(require, exports, module){
	'use strict';

	var BaseCollectionView = require('views/base/collection');
	var template = require('templates/elements/menu/main/menu');
	var CrmProjectListItem = require('./item');
	require('css!styles/elements/menu/main/menu');

	var MainMenuListView = BaseCollectionView.extend({

		noWrap: true,

		autoRender: true,

		itemView: CrmProjectListItem,

		listSelector: '.element-main-menu-l',

		template: template

	});

	return MainMenuListView;
});