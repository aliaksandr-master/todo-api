define(function(require, exports, module){
	'use strict';

	var BaseView = require('views/base/view');
	var template = require('templates/modules/todo/list-nav');
	require('css!styles/modules/todo/list-nav');

	var TodoItemView = BaseView.extend({

		events: {
			"click .todo-list-nav-prev": "prev",
			"click .todo-list-nav-next": "next"
		},

		getTemplateData: function () {
			var data = TodoItemView.__super__.getTemplateData.apply(this, arguments);
			data.nextListId = this.nextId;
			data.prevListId = this.prevId;
			data.currListId = this.currId;
			return data;
		},

		next: function () {
			this.trigger('next');
		},

		prev: function () {
			this.trigger('prev');
		},

		autoRender: false,

		template: template

	});

	return TodoItemView;
});