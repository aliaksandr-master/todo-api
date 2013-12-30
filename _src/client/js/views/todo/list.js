define(function(require, exports, module){
	"use strict";


	var $ = require("jquery");
	require("jqueryui");
	require('jquery/swipe');

	require('css!styles/todo/list');
	var BaseCollectionView = require('views/base/collection-view');

	var ListItemView = require("views/todo/list-item");
	var template = require("templates/todo/list");

	var TodoLists = BaseCollectionView.extend({

		listSelector: '.todo-list-l',
		itemSelector: '.todo-list-li',
		template: template,
		autoRender: true,
		itemView: ListItemView,

		regions: {
			"todo-list/paginator": ".todo-list-line"
		},

		events: {
			"click .todo-list-input-add-submit": "onAadBtnClick",
			"change .todo-list-title": "saveTitle",
			"keypress .todo-list-title": "toAddInput",
			"keypress .todo-list-input-add": "createOnEnter",
			'swipeleft .todo-list-li': 'onSwipeLeft',
			'swiperight .todo-list-li': 'onSwipeRight'
		},

		initialize: function(options) {

			this.collectionModel = options.collectionModel;

			TodoLists.__super__.initialize.apply(this, arguments);

		},

		onSwipeLeft: function(e){
			console.log("swipe left", e);
			return false;
		},

		onSwipeRight: function(e){
			console.log("swipe right", e);
			return false;
		},

		attach: function(){
			ListItemView.__super__.attach.apply(this, arguments);
			var that = this;

			this.$('.todo-list-title').val(this.collectionModel.get("title"));
			this._initTitleInputStatus();

			var $l = this.$(".todo-list-l");
			$l.sortable({

				handle: ".todo-list-li-move",

				placeholder: "todo-list-li-placeholder",

				update: function(event, ui){

					$l.children(".todo-list-li").each(function(i){
						var $e = $(this);
						var m = that.collection.get($e.attr("data-itemId"));
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

		//Создание элемента
		onAadBtnClick: function(){
			var $input = $(".todo-list-input-add");
			var title = ($input.val()||"").trim();

			if(!title){
				return;
			}

			this.collection.create({
				sortOrder: this.collection.length,
				listId: this.collectionModel.get("listId"),
				itemId: Date.now() + "-" + Math.round(Math.random()*1000),
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
			var $titleInput = this.$('.todo-list-title');
			var val = $titleInput.val().trim();
			if(val.length){
				$titleInput.removeClass("-empty");
				this.$(".todo-list-input-add").focus();
			}else{
				$titleInput.addClass("-empty");
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
			this.$(".todo-list-input-add").focus();
		}
	});

	return TodoLists;

});