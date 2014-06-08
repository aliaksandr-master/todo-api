define(function(require, exports, module){
	'use strict';

	var Session = require('lib/session');
	var BaseController = require('controllers/base/controller');

	var CrmProjectCollection = require('record/modules/crm/project/collection');

	var CrmProjectListView = require('views/modules/crm/project/project-list');
	var CrmProjectView = require('views/modules/crm/project/project');

	var StaticController = BaseController.extend({

		list: function () {
			this.collection = new CrmProjectCollection();
			this.collection.fetch().then(function () {
				this.view = new CrmProjectListView({
					collection: this.collection,
					region: "main/content"
				});
			}.bind(this));
		},

		item: function(){

		}

	});

	return StaticController;
});