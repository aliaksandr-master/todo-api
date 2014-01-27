define(function(require){
    "use strict";

	var BaseView = require("views/base/view");

	var template = require('templates/todo/list-item');
	require('css!styles/todo/list-item');

    var ListItemView = BaseView.extend({

		initialize: function(){
			ListItemView.__super__.initialize.apply(this, arguments);
			this.listenTo(this.model, "sync", function(){
				var listId = this.model.get("listId");
				var itemId = this.model.get("itemId");
				this.$(".todo-list-li-link").attr("href", '/todo/'+listId+'/item/'+itemId+'/');
				this.$el.attr("data-itemId", itemId);
			});
		},

        template: template,

		autoRender: true

    });

	return ListItemView;
});