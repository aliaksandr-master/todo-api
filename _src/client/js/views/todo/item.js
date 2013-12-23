define(function(require, exports, module){
    "use strict";

    var BaseView = require('views/base/view');
    var template = require('templates/todo/item');

	var TodoItemView = BaseView.extend({

		noWrap: true,
		template: template

	});

    return TodoItemView;
});