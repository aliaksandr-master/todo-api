define(function(require, exports, module){
	"use strict";


	var $ = require("jquery");
	require("jqueryui");
	var BaseCollectionView = require('views/base/collection-view');

	var ListItemView = require("views/todo/list-item");
	var template = require("templates/todo/list");

	var TodoLists = BaseCollectionView.extend({

		className:"todo-list",
		listSelector: '.todo-list-l',
		itemSelector: '.todo-list-li',
		template: template,
		autoRender: true,
		itemView: ListItemView,

		events: {
			"click .remove-todo-btn": "purgeThisTodoList",
			"click .todo-l-input-add-submit": "onAadBtnClick",
			"change .todo-l-title": "saveTitle",
			"keypress .todo-l-title": "toAddInput",
			"keypress .todo-l-input-add":  "createOnEnter"
		},

		initialize: function(options) {

			this.collectionModel = options.collectionModel;

			TodoLists.__super__.initialize.apply(this, arguments);

		},

		attach: function(){
			ListItemView.__super__.attach.apply(this, arguments);
			var that = this;

			this.$('.todo-l-title').val(this.collectionModel.get("title"));
			this._initTitleInputStatus();

			var $l = this.$(".todo-list-l");
			$l.sortable({

				handle: ".todo-li-move",

				update: function(event, ui){

					$l.children().each(function(i){
						var $e = $(this);
						var m = that.collection.get($e.attr("data-itemId"));
						if(m != null){
							m.save({
								sort_order: i
							});
						}
					});

					that.collection.sort();
				}
			});
		},

		purgeThisTodoList: function(){
			this.collection.clean();
			this.collectionModel.destroy();
			this.remove();
		},

		//Создание элемента
		onAadBtnClick: function(){
			var $input = $(".todo-l-input-add");
			var title = ($input.val()||"").trim();

			if(!title){
				return;
			}

			this.collection.create({
				listId: this.collectionModel.get("listId"),
				title: title
			});

			$input.val('');
		},

		createOnEnter: function(e) {
			if (e.keyCode === 13){
				this.onAadBtnClick();
			}
		},

		_initTitleInputStatus:function(){
			var $titleInput = this.$('.todo-l-title');
			var val = $titleInput.val().trim();
			if(val.length){
				$titleInput.removeClass("todo-l-title--empty");
				this.$(".todo-l-input-add").focus();
			}else{
				$titleInput.addClass("todo-l-title--empty");
				$titleInput.focus();
			}
			return val;
		},

		saveTitle: function(e){
			var val = this._initTitleInputStatus();
			this.collectionModel.set("title", val);
			this.collectionModel.save();
		},

		toAddInput: function(e){
			if(e.keyCode !== 13 || !($(e.target).val()||"").trim()){
				return;
			}
			this.$(".todo-l-input-add").focus();
		}
	});

	return TodoLists;

});