define(function(require){
    "use strict";

	var BaseView = require("views/base/view");

	var template = require('templates/modules/todo/list-item');
	require('css!styles/modules/todo/list-item');

    var ListItemView = BaseView.extend({

		events: {
			'change .chk': 'toggleDone'
		},

		listen: {
			'change:title model': 'updateTittle',
			'change:done model': 'updateDone',
			'change:itemId model': 'updateId'
		},

		updateTittle: function (){
			var tittle = this.model.get('title');
			this.$('.todo-list-li-link').html((tittle == null ? "" : tittle).replace(/^\s+/, "").split(/[\n\r]+/).shift());
		},

		updateId: function () {
			var listId = this.model.get("listId");
			var itemId = this.model.get("itemId");
			this.$(".todo-list-li-link").attr("href", '/todo/'+listId+'/item/'+itemId+'/');
			this.$el.attr("data-itemId", itemId);
			this.$('.chk').attr("id", 'chk-'+itemId);
			this.$('.chk + label').attr("for", 'chk-'+itemId);
		},

		updateDone: function () {
			if (this.model.get('done')) {
				this.$el.addClass('-done');
				this.$('.chk').attr('checked', true).prop('checked', true);
			} else {
				this.$el.removeClass('-done');
				this.$('.chk').attr('checked', false).prop('checked', false);
			}
		},

		toggleDone: function () {
			this.model.save({
				done: this.$('.chk').is(':checked')
			});
		},

		initialize: function () {
			ListItemView.__super__.initialize.apply(this, arguments);
			this.listenTo(this.model, "sync", function(){
			});
		},

        template: template,

		autoRender: true

    });

	return ListItemView;
});