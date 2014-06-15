define(function(require, exports, module){
	'use strict';

	var Session = require('lib/session');
	var BaseController = require('controllers/base/controller');

	var CrmProjectModel = require('models/modules/crm/project/model');
	var CrmProjectView = require('views/modules/crm/project/project/project');

	var StaticController = BaseController.extend({

		show: function(params){
			var that = this;
			that.projectModel = new CrmProjectModel({id: params.projectId});
			that.projectModel.fetch().then(function () {
				that.projectView = new CrmProjectView({
					model: that.projectModel,
					region: 'layout/content'
				});
			});
		}

	});

	return StaticController;
});