define(function(require, exports, module){
    "use strict";


	var BaseView = require('views/base/view'),
		template = require('templates/todo/lists-item');

	require('css!styles/todo/lists-item');

	var TodoListsItem = BaseView.extend({

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