define(function(require, exports, module){
	'use strict';

	var Session = require('lib/session');
	var BaseController = require('controllers/base/controller');

	var CrmProjectCollection = require('record/modules/crm/project/collection');

	var CrmProjectListView = require('views/modules/crm/project/project-list');
	var CrmProjectView = require('views/modules/crm/project/project');

	var StaticController = BaseController.extend({

		index: function () {
			this.projectCollection = new CrmProjectCollection();
			this.projectCollection.fetch().then(function () {
				this.projectsView = new CrmProjectListView({
					collection: this.projectCollection,
					region: "main/content"
				});
				this.projectsView.render();
			}.bind(this));
		},

		item: function(){

		}

	});

	return StaticController;
});