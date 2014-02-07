define(function(require, exports, module){
    "use strict";

	var BaseCollectionView = require('views/base/collection-view');
	var PaginatorItemView = require('views/todo/paginator-item');
	var template = require('templates/todo/paginator');
	require('css!styles/todo/paginator');

    var TodoListPaginator = BaseCollectionView.extend({

		initialize: function(options) {

			this.collectionModel = options.collectionModel;

			TodoListPaginator.__super__.initialize.apply(this, arguments);

		},

		render: function(){
			TodoListPaginator.__super__.render.apply(this, arguments);
			var length = this.collection.length;
			if(length > 1){
				this.$el.removeClass('-one');
				this.$(".todo-paginator-li").width((Math.round(100*10/length)/10)+"%");
				this.$("#todo-paginator-li-"+this.collectionModel.get("listId")).addClass("-active");
			}else{
				this.$el.addClass('-one');
			}
		},

		listSelector: '.todo-paginator-l',
		template: template,
		autoRender: true,
		itemView: PaginatorItemView
	});

    return TodoListPaginator;
});