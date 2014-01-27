define(function(require, exports, module){
    "use strict";

	var BaseView = require('views/base/view');

	var _ = require("underscore");

	var template = require('templates/todo/paginator-item');
	require('css!styles/todo/paginator-item');


    var TodoPaginatorItemView = BaseView.extend({

		bindings: {
			".todo-paginator-li-link": "title"
		},

		autoRender: true,
		template: template
	});

    return TodoPaginatorItemView;
});