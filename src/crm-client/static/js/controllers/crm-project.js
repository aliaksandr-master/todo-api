define(function(require, exports, module){
	"use strict";

	var Session = require('lib/session');
	var BaseController = require('controllers/base/controller');

	var CrmProjectCollection = require('record/crm/project/collection');

	var CrmProjectListView = require('views/crm/project/list');
	var CrmProjectItemView = require('views/crm/project/item');

	var StaticController = BaseController.extend({

		list: function () {
			var ctrl = this;
			this.collection = new CrmProjectCollection();
			this.collection.fetch().then(function () {
				ctrl.view = new CrmProjectListView({
					collection: ctrl.collection,
					region: "main/content"
				});
			});

		},

		item: function(){

		}

	});

	return StaticController;
});