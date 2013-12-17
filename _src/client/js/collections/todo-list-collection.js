define(function(require){
	"use strict";

	var  ListModel = require('models/todo-list');
	var  LocalStorageCollection = require('collections/base/local-storage-collection');


	var TodoListCollection = LocalStorageCollection.extend({

		model: ListModel,

		initialize: function (o) {

			this.listId = (o || {}).listId || 0;
			this._initLocalStorage("list" + this.listId);

		}

	});

	return TodoListCollection;

});