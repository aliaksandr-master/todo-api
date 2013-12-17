define(function(require, exports, module){
	"use strict";

	var BaseView = require('views/base/view');
	var template = require('templates/pages/todo-list');

	var PageTodoListView = BaseView.extend({

		template: template

	});

	return PageTodoListView;
});