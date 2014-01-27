define(function(require){
	"use strict";

	var ListModel = require('models/todo/list');
	var BaseCollection = require('collections/base/collection');

	var TodoListsCollection = BaseCollection.extend({

		url: function(){
			return "/todo/";
		},

		model: ListModel,

		comparator: function (model) {
			return model.get("sortOrder");
		}

	});

	return TodoListsCollection;

});