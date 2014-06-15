define(function(require, exports, module){
	'use strict';

	var BaseCollectionView = require('views/base/collection');
	var template = require('templates/modules/crm/project/projects/projects');
	var CrmProjectListItem = require('./project');
	require('css!styles/modules/crm/project/projects/projects');

	var CrmProjectListView = BaseCollectionView.extend({

		noWrap: true,

		itemView: CrmProjectListItem,

		listSelector: '.crm-project-list-l',

		template: template

	});

	return CrmProjectListView;
});