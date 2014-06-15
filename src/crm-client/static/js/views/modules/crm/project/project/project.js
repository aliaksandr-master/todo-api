define(function(require, exports, module){
	'use strict';

	var BaseView = require('views/base/view');
	var template = require('templates/modules/crm/project/project/project');

	require('css!styles/modules/crm/project/project/project');

	var CrmProjectItemView = BaseView.extend({

		autoRender: true,

		template: template

	});

	return CrmProjectItemView;
});