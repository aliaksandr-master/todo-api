define(function(require, exports, module){
    "use strict";

    var _ = require("underscore"),
		$ = require("jquery");

	var UserRelController = require('controllers/base/user-rel');

	var TodoListCollectionView = require('views/modules/todo/list');
	var TodoListsCollectionView = require('views/modules/todo/lists');
	var TodoPaginatorView = require('views/modules/todo/paginator');
	var TodoNav = require('views/modules/todo/list-nav');

	var TodoListItemCollection = require('record/modules/todo/list/item/collection');
	var TodoListsCollection = require('record/modules/todo/list/collection');

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
				this.redirectTo('todo-list',{
					listId: listModel.get("listId")
				});
			});
		},

		index: function (params) {
			this.todoListsCollection = new TodoListsCollection();
			this.todoListsCollection.fetch().then(function () {
				this.todoListsView = new TodoListsCollectionView({
					collection: this.todoListsCollection,
					region: "main/content"
				});
			}.bind(this), function () {
				console.error(this, arguments);
			});
		},

		list: function(params){
			this.todoListsCollection = new TodoListsCollection();

			this.todoListsCollection.fetch().then(function(){
				this.listModel = this.todoListsCollection.get(params.listId);

				if(!this.listModel){
					this.redirectTo('todo-lists');
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
					region: 'main/content'
				});

				this.listenTo(this.todoListView, 'filter:change', function (_filter) {
					filter = _filter;
				});

				var index = this.todoListsCollection.indexOf(this.listModel);

				this.todoNav = new TodoNav({
					region: "main/footer"
				});

				this.todoNav.currId = this.listModel.id;
				this.todoNav.prevId = index === 0 ? this.todoListsCollection.at(this.todoListsCollection.length - 1).id : this.todoListsCollection.at(index - 1).id;
				this.todoNav.nextId = index === this.todoListsCollection.length - 1 ? this.todoListsCollection.at(0).id : this.todoListsCollection.at(index + 1).id;

				this.todoNav.render();

				this.todoPaginator = new TodoPaginatorView({
					collection: this.todoListsCollection,
					collectionModel: this.listModel,
					region: "main/footer"
				});

				var that = this;
				$(document)
					.on('swipeleft.mainSwipe', _.throttle(function(e) {
						var firstIndex = 0,
							index = that.todoListsCollection.indexOf(that.listModel),
							lastIndex = that.todoListsCollection.length - 1;

						var prevListId = that.todoListsCollection.at(index > firstIndex ? index - 1 : lastIndex).get("listId");
						$(this).off(".mainSwipe");
						that.redirectTo('todo-list',{
							listId: prevListId
						});
					}, 200))
					.on('swiperight.mainSwipe', _.throttle(function(e) {
						var firstIndex = 0,
							index = that.todoListsCollection.indexOf(that.listModel),
							lastIndex = that.todoListsCollection.length - 1;

						var nextListId = that.todoListsCollection.at(index < lastIndex ? index + 1 : firstIndex).get("listId");
						$(this).off(".mainSwipe");
						that.redirectTo('todo-list',{
							listId: nextListId
						});
					}, 200));
			}.bind(this));
		}

	});

    return TodoController;
});