define(function(require, exports, module){
	"use strict";

	var BaseView = require('views/base/view');
	var template = require('templates/modules/crm/project/item');

	require('css!styles/modules/crm/project/item');

	var CrmProjectItemView = BaseView.extend({

		autoRender: true,
		template: template

	});

	return CrmProjectItemView;
});