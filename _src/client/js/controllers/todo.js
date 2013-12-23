define(function(require, exports, module){
    "use strict";

    var BaseController = require('controllers/base/controller');

	var TodoListCollectionView = require('views/todo/list');
	var TodoListItemCollection = require('collections/todo/list-item');

	var TodoListsCollectionView = require('views/todo/lists');
	var TodoListsCollection = require('collections/todo/lists');


	var TodoItemView = require('views/todo/item');

	var TodoController = BaseController.extend({

		initialize: function(){
			TodoController.__super__.initialize.apply(this, arguments);
			this.todoListsCollection = new TodoListsCollection({id: 0});
			this.todoListsCollection.fetch();
		},

		index: function(params){

			this.todoListsView = new TodoListsCollectionView({
				collection: this.todoListsCollection,
				region: "main"
			});

			this.listenTo(this.todoListsCollection, "add", function(){
				this.redirectTo({
					url: "/todo/-" + this.todoListsCollection.length + "/"
				});
			});

		},

		item: function(params){

			this.listModel = this.todoListsCollection.get(params.listId);

			if(!this.listModel){
				this.redirectTo({url: "/todo/"});
				return;
			}

			this.listItemColection = new TodoListItemCollection(params.listId);
			this.listItemColection.fetch();

			this.itemModel = this.listItemColection.get(params.itemId);

			if(!this.itemModel){
				this.redirectTo({url: "/todo/" + params.listId + "/"});
				return;
			}

			console.log(this.itemModel);

			this.view = new TodoItemView({
				model: this.itemModel,
				region: 'main'
			});
		},

		list: function(params){

			this.listModel = this.todoListsCollection.get(params.listId);

			if(!this.listModel){
				this.redirectTo({url: "/todo/"});
				return;
			}

			this.listItemColection = new TodoListItemCollection(params.listId);
			this.listItemColection.fetch();

			this.todoListView = new TodoListCollectionView({
				collection: this.listItemColection,
				collectionModel: this.listModel,
				region: 'main'
			});

			this.listenTo(this.listModel, "remove", function(){
				this.redirectTo({url: "/todo/"});
			});
		}

	});

    return TodoController;
});