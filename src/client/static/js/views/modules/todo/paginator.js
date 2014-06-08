define(function(require, exports, module){
    "use strict";

	var BaseCollectionView = require('views/base/collection-view');
	var PaginatorItemView = require('views/modules/todo/paginator-item');
	var template = require('templates/modules/todo/paginator');
	require('css!styles/modules/todo/paginator');

    var TodoListPaginator = BaseCollectionView.extend({

		listSelector: '.todo-paginator-l',
		template: template,
		autoRender: true,
		itemView: PaginatorItemView,

		initialize: function(options) {
			this.collectionModel = options.collectionModel;
			TodoListPaginator.__super__.initialize.apply(this, arguments);
		},

		render: function(){
			TodoListPaginator.__super__.render.apply(this, arguments);
			var length = this.collection.length;
			this.$("#todo-paginator-li-"+this.collectionModel.get("listId")).addClass("-active");
		}
	});

    return TodoListPaginator;
});