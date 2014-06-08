define(function(require, exports, module){
	'use strict';

	var BaseView = require('views/base/view');
	var template = require('templates/modules/crm/project/project-list');

	var CrmProjectListItem = require('./project-list-item');

	var Chaplin = require('chaplin');
	var CrmProjectListView = Chaplin.CollectionView.extend({

		itemView: CrmProjectListItem,

		getTemplateFunction: BaseView.prototype.getTemplateFunction,

		template: template

	});

	return CrmProjectListView;
});