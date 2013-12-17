define(function(require, exports, module){
	"use strict";

	var BaseView = require('views/base/view'),
		template = require('templates/pages/todo-index');

	var PageTodoIndexView = BaseView.extend({

		initialize: function(){
			BaseView.prototype.initialize.apply(this,arguments);
			this.formSubmit();
		},

		template: template,

		autoRender: true

	});

	template = null;

	return PageTodoIndexView;
});
