define(function(require){
	'use strict';

	var BaseCollection = require('record/base/collection');
	var ListModel = require('./model');

	var TodoListsCollection = BaseCollection.extend({

		url: function(){
			return "/todo/list/";
		},

		model: ListModel,

		comparator: function (model) {
			return model.get("sortOrder");
		}

	});

	return TodoListsCollection;

});