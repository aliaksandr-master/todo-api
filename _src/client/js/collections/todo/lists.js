define(function(require){
	"use strict";

	var  ListModel = require('models/todo/list');
	var  LocalStorageCollection = require('collections/base/collection');

	var length = 0;

	var TodoListsCollection = LocalStorageCollection.extend({

		storagePref: "todo-lists-",

		model: ListModel,

		initialize: function () {
			TodoListsCollection.__super__.initialize.apply(this, arguments);

			this.initStorage();
		}

	});

	return TodoListsCollection;

});