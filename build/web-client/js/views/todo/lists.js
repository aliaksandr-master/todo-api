define(function(require, exports, module){
	"use strict";

	var BaseCollectionView = require('views/base/collection-view');

	var TodoListsItem = require('views/todo/lists-item');
	var template = require('templates/todo/lists');
	var $ = require('jquery');
	require('css!styles/todo/lists');

	var TodoLists = BaseCollectionView.extend({

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