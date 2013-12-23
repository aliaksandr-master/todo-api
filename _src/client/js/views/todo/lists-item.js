define(function(require, exports, module){
    "use strict";


	var BaseView = require('views/base/view'),
		template = require('templates/todo/lists-item');

	var TodoListsItem = BaseView.extend({

		noWrap: true,

		template: template
	});

	return TodoListsItem;
});