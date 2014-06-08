define(function(require, exports, module){
	"use strict";

	var BaseView = require('views/base/view');
	var template = require('templates/crm/project/item');

	require('css!styles/crm/project/item');

	var CrmProjectItemView = BaseView.extend({

		autoRender: true,
		template: template

	});

	return CrmProjectItemView;
});