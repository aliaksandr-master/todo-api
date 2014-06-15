define(function(require, exports, module){
	'use strict';

	var BaseController = require('controllers/base/controller');
	var CrmProjectCollection = require('models/modules/crm/project/collection');
	var CrmProjectListView = require('views/modules/crm/project/projects/projects');

	var StaticController = BaseController.extend({

		show: function () {
			var that = this;
			that.projectCollection = new CrmProjectCollection();
			that.projectCollection.fetch().then(function (resp) {
				that.projectsView = new CrmProjectListView({
					collection: that.projectCollection,
					region: "layout/content"
				});
			});
		}

	});

	return StaticController;
});