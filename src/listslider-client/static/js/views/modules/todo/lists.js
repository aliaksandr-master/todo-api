define(function(require, exports, module){
	"use strict";

	var $ = require('jquery');
	var BaseCollectionView = require('views/base/collection-view');
	var TodoListsItem = require('views/modules/todo/lists-item');
	var template = require('templates/modules/todo/lists');
	require("jquery-ui/sortable");
	require("jquery-ui-touch-punch");
	require('css!styles/modules/todo/lists');

	var TodoLists = BaseCollectionView.extend({

		events: {
			'change .todo-lists-view-select': 'viewChange'
		},

		viewChange: function () {

		},

		attach: function(){
			TodoLists.__super__.attach.apply(this, arguments);
			var that = this;

			var $l = this.$(".todo-lists-l");
			$l.sortable({

				handle: ".todo-lists-li-move",

				placeholder: "todo-lists-li-placeholder",

				activate: function(){
					var $li = that.$(".todo-lists-li");
					$l.css("height", $li.outerHeight() * ($li.length + 1));
				},

				stop: function(){
					$l.attr("style", "");
				},

				update: function(event, ui){

					$l.children().each(function(i){
						var $e = $(this);
						var m = that.collection.get($e.attr("data-listId"));
						if(m != null){
							m.save({
								sortOrder: i
							});
						}
					});

					that.collection.sort();
				}
			});
		},

		listSelector: '.todo-lists-l',
		template: template,
		autoRender: true,
		itemView: TodoListsItem
	});

	return TodoLists;
});