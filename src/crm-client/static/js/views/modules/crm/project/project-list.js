define(function(require, exports, module){
	'use strict';

	var BaseCollectionView = require('views/base/collection-view');
	var CrmProjectListItemView = require('views/base/collection-view');
	var template = require('templates/modules/crm/project/project-list');

	require('css!styles/modules/crm/project/project-list');

	var CrmProjectListView = BaseCollectionView.extend({

		itemView: CrmProjectListItemView,

		listSelector: '.crm-project-list-l',

		autoRender: true,

		template: template

	});

	return CrmProjectListView;
});