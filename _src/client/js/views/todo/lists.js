define(function(require, exports, module){
    "use strict";

    var BaseCollectionView = require('views/base/collection-view');

    var TodoListsItem = require('views/todo/lists-item');
	var template = require('templates/todo/lists');

	var TodoLists = BaseCollectionView.extend({

		events: {
			'click .todo-lists-add-btn': 'addNewList'
		},

		addNewList: function(){

			var newId = -this.collection.length - 1;

			this.collection.create({
				title: "",
				listId: newId
			});
		},

		className:"todo-lists",
		listSelector: '.todo-lists-l',
		template: template,
		autoRender: true,
		itemView: TodoListsItem
	});

    return TodoLists;
});