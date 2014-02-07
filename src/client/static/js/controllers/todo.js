define(function(require, exports, module){
    "use strict";

    var _ = require("underscore"),
		$ = require("jquery");

	var userSession = require("lib/session");
	var UserRelController = require('controllers/base/user-rel');

	var TodoListCollectionView = require('views/todo/list');
	var TodoListsCollectionView = require('views/todo/lists');
	var TodoItemView = require('views/todo/item');
	var TodoListShareView = require('views/todo/list-share');
	var TodoPaginatorView = require('views/todo/paginator');

	var TodoListItemCollection = require('collections/todo/list-item');
	var TodoListsCollection = require('collections/todo/lists');

	require('jquery.swipe');

	var filter = {
		done: false,
		active: false
	};

	var TodoController = UserRelController.extend({

		initialize: function(){
			TodoController.__super__.initialize.apply(this, arguments);
		},

		create: function () {
			this.todoListsCollection = new TodoListsCollection();

			var listModel = this.todoListsCollection.create();

			this.listenTo(listModel, "sync", function () {
				this.redirectTo({
					url: "/todo/" + listModel.get("listId") + "/item/"
				});
			});
		},

		index: function (params) {
			this.todoListsCollection = new TodoListsCollection();
			this.todoListsCollection.fetch().then(function () {
				this.todoListsView = new TodoListsCollectionView({
					collection: this.todoListsCollection,
					region: "main"
				});
			}.bind(this), function () {
				console.error(this, arguments);
			});
			this.initMenu();
		},

		list: function(params){
			this.initMenu();
			this.todoListsCollection = new TodoListsCollection();

			this.todoListsCollection.fetch().then(function(){
				this.listModel = this.todoListsCollection.get(params.listId);

				if(!this.listModel){
					this.redirectTo({
						url: "/todo/"
					});
					return;
				}

				this.listModel.set({
					filter: filter
				});

				this.listItemColection = new TodoListItemCollection(null, {
					propModel: this.listModel
				});
				this.listItemColection.fetch();

				this.todoListView = new TodoListCollectionView({
					collection: this.listItemColection,
					collectionModel: this.listModel,
					region: 'main'
				});

				this.listenTo(this.todoListView, 'filter:change', function (_filter) {
					filter = _filter;
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