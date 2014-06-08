define(function(require, exports, module){
	"use strict";

	var BaseCollectionView = require('views/base/collection-view');
	var CrmProjectListItemView = require('views/base/collection-view');
	var template = require('templates/crm/project/list');

	require('css!styles/crm/project/list');

	var CrmProjectListView = BaseCollectionView.extend({

		itemView: CrmProjectListItemView,

		listSelector: '.crm-project-list-l',

		autoRender: true,

		template: template

	});

	return CrmProjectListView;
});