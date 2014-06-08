define(function(require, exports, module){
    "use strict";


	var BaseView = require('views/base/view'),
		template = require('templates/modules/todo/lists-item');

	require('css!styles/modules/todo/lists-item');

	var TodoListsItem = BaseView.extend({

		initialize: function(){
			TodoListsItem.__super__.initialize.apply(this, arguments);
			this.listenTo(this.model, "sync", function(){
				var listId = this.model.get("listId");
				this.$(".todo-lists-li-link").attr("href", '/todo/'+listId+'/item/');
				this.$el.attr("data-listId", listId);
			});
		},

		events: {
			"click .todo-lists-li-remove": "confirmRemove"
		},

		template: template,

		confirmRemove: function(){
			if(confirm("Are You sure to remove")){
				this.model.destroy();
			}
		}
	});

	return TodoListsItem;
});