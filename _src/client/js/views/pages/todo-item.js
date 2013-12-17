define(function(require, exports, module){
    "use strict";

    var BaseView = require('views/base/view');
    var template = require('templates/pages/todo-item');

	var PageTodoItemView = BaseView.extend({

		template: template

	});

    return PageTodoItemView;
});