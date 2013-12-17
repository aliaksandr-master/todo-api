define(function(require, exports, module){
    "use strict";

    var BaseController = require('controllers/base/controller');
	var PageTodoIndexView = require('views/pages/todo-index');
	var PageTodoListView = require('views/pages/todo-list');
	var PageTodoItemView = require('views/pages/todo-item');

	var TodoController = BaseController.extend({

		index: function(params){
			this.view = new PageTodoIndexView({
				region: 'main'
			});
		},

		item: function(params){
			this.view = new PageTodoItemView({
				region: 'main'
			});
		},

		list: function(params){
			this.view = new PageTodoListView({
				region: 'main'
			});
		}

	});

    return TodoController;
});