define(function(require, exports, module){
    "use strict";

	var BaseView = require('views/base/view');

	var _ = require("underscore");

	var template = require('templates/todo/paginator-item');
	require('css!styles/todo/paginator-item');


    var TodoPaginatorItemView = BaseView.extend({

		getTemplateData: function() {
			var data = _.extend({
				index: this.model.collection.indexOf(this.model) + 1
			}, TodoPaginatorItemView.__super__.getTemplateData.apply(this, arguments));
			return data;
		},


		autoRender: true,
		template: template
	});

    return TodoPaginatorItemView;
});