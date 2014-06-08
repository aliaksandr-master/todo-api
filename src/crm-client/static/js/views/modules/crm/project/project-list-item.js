define(function(require, exports, module){
	'use strict';

	var BaseView = require('views/base/view');
	var template = require('templates/modules/crm/project/project-list-item');

	require('css!styles/modules/crm/project/project-list-item');

	var CrmProjectListItemView = BaseView.extend({

		autoRender: true,
		template: template

	});

	return CrmProjectListItemView;
});