define(function(require, exports, module){
    "use strict";

    var BaseController = require('controllers/base/controller');

	var _ = require("underscore"),
		Session = require("lib/session"),
		$ = require("jquery");
	require('jquery.swipe');

	var TodoListCollectionView = require('views/todo/list');
	var TodoListItemCollection = require('collections/todo/list-item');
	var TodoListsCollectionView = require('views/todo/lists');
	var TodoPaginatorView = require('views/todo/paginator');
	var TodoListsCollection = require('collections/todo/lists');
	var TodoItemView = require('views/todo/item');
	var TodoListShareView = require('views/todo/list-share');
	var TodoController = BaseController.extend({

		initialize: function(){
			TodoController.__super__.initialize.apply(this, arguments);
			$(document).off('.mainSwipe');
			if(!Session.logged()){
				this.redirectTo({url: '/user/login/'});
			}
		},

		create: function(){
			this.todoListsCollection = new TodoListsCollection();

			var listModel = this.todoListsCollection.create();

			this.listenTo(listModel, "sync", function(){
				this.redirectTo({
					url: "/todo/" + listModel.get("listId") + "/item/"
				});
			});
		},

		index: function(params){
			this.todoListsCollection = new TodoListsCollection();
			this.todoListsCollection.fetch().then(function(){
				this.todoListsView = new TodoListsCollectionView({
					collection: this.todoListsCollection,
					region: "main"
				});

			}.bind(this));
		},

		shared: function(params){
//			params.listId

//			this.listShareView = new TodoListShareView({
//				model: this.listModel,
//				region: "main"
//			});
		},

		share: function(params){
			this.todoListsCollection = new TodoListsCollection();
			this.todoListsCollection.fetch().then(function(){

				this.listModel = this.todoListsCollection.get(params.listId);

				if(!this.listModel){
					this.redirectTo({
						url: "/todo/"
					});
					return;
				}

				this.listShareView = new TodoListShareView({
					model: this.listModel,
					region: "main"
				});

				this.listenTo(this.listShareView, "modelWasSaved", function(){
					this.redirectTo({
						url: "/todo/"
					});
				}, this);

			}.bind(this));
		},

		item: function(params){
			this.todoListsCollection = new TodoListsCollection();
			this.todoListsCollection.fetch().then(function(){
				this.listModel = this.todoListsCollection.get(params.listId);
				if(!this.listModel){
					this.redirectTo({url: "/todo/"});
					return;
				}
				this.listItemColection = new TodoListItemCollection({
					propModel: this.listModel
				});
				this.listItemColection.fetch().then(function(){
					this.itemModel = this.listItemColection.get(params.itemId);

					if(!this.itemModel){
						this.redirectTo({url: "/todo/" + params.listId + "/item/"});
						return;
					}

					this.todoItemView = new TodoItemView({
						model: this.itemModel,
						region: 'main'
					});

					this.listenTo(this.todoItemView, "modelWasRemoved", function(){
						this.redirectTo({url: "/todo/" + params.listId + "/item/"});
					}, this);

					this.listenTo(this.todoItemView, "modelWasSaved", function(){
						this.redirectTo({url: "/todo/" + params.listId + "/item/"});
					}, this);

				}.bind(this));
			}.bind(this));
		},

		list: function(params){
			this.todoListsCollection = new TodoListsCollection();

			this.todoListsCollection.fetch().then(function(){
				this.listModel = this.todoListsCollection.get(params.listId);

				if(!this.listModel){
					this.redirectTo({
						url: "/todo/"
					});
					return;
				}

				this.listItemColection = new TodoListItemCollection({
					propModel: this.listModel
				});
				this.listItemColection.fetch();

				this.todoListView = new TodoListCollectionView({
					collection: this.listItemColection,
					collectionModel: this.listModel,
					region: 'main'
				});

				this.TodoPaginator = new TodoPaginatorView({
					collection: this.todoListsCollection,
					collectionModel: this.listModel,
					region: "todo-list/paginator"
				});

				var that = this;
				$(document)
					.on('swipeleft.mainSwipe', _.throttle(function(e) {
						var firstIndex = 0,
							index = that.todoListsCollection.indexOf(that.listModel),
							lastIndex = that.todoListsCollection.length - 1;

						var prevListId = that.todoListsCollection.at(index > firstIndex ? index - 1 : lastIndex).get("listId");
						$(this).off(".mainSwipe");
						that.redirectTo({url: "/todo/" + prevListId + "/item/"});
					}, 200))
					.on('swiperight.mainSwipe', _.throttle(function(e) {
						var firstIndex = 0,
							index = that.todoListsCollection.indexOf(that.listModel),
							lastIndex = that.todoListsCollection.length - 1;

						var nextListId = that.todoListsCollection.at(index < lastIndex ? index + 1 : firstIndex).get("listId");
						$(this).off(".mainSwipe");
						that.redirectTo({url: "/todo/" + nextListId + "/item/"});
					}, 200));
			}.bind(this));
		}

	});

    return TodoController;
});