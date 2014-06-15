define(function(require, exports, module){
	'use strict';

	var BaseView = require('views/base/view'),
		template = require('templates/modules/crm/project/projects/project');

	require('css!styles/modules/crm/project/projects/project');

	var CrmProjectListItemView = BaseView.extend({

		tagName: 'tr',

		autoRender: false,

		noWrap: false,

		template: template

	});

	return CrmProjectListItemView;
});