define(function(require, exports, module){
	"use strict";

	var BaseView = require('views/base/view');
	var template = require('templates/crm/project/list-item');

	require('css!styles/crm/project/list-item');

	var CrmProjectListItemView = BaseView.extend({

		autoRender: true,
		template: template

	});

	return CrmProjectListItemView;
});