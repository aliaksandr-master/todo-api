define(function(require, exports, module){
    "use strict";

    var BaseView = require('views/base/view');
    var template = require('templates/todo/item');
    require('css!styles/todo/item');

	var TodoItemView = BaseView.extend({

		events: {
			"click .todo-list-item-save": "saveModel",
			"click .todo-li-btn-remove":  "removeModel"
		},

		binds: {
			"change .todo-list-item-title": "title",
			"change .todo-list-item-done-chk": "done"
		},

		saveModel: function(){
			this.model.save();
			this.remove();
			this.trigger("modelWasSaved");
		},

		removeModel: function(){
			if(confirm("Are You Sure To Remove ?")){
				this.model.destroy();
				this.remove();
				this.trigger("modelWasRemoved");

			}
		},

		autoRender: true,

		template: template

	});

    return TodoItemView;
});