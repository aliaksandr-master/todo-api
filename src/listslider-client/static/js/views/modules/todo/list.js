define(function(require, exports, module){
	"use strict";


	var $ = require("jquery");
	var _ = require("underscore");
	var BaseCollectionView = require('views/base/collection-view');
	var TodoItemView = require('views/modules/todo/item');
	var ListItemView = require("views/modules/todo/list-item");
	var template = require("templates/modules/todo/list");

	require("jquery-ui/sortable");
	require("jquery-ui/draggable");
	require("jquery-ui/droppable");
	require("jquery-ui-touch-punch");
	require('jquery.swipe');
	require('css!styles/modules/todo/list');

	var TodoLists = BaseCollectionView.extend({

		listSelector: '.todo-list-l',

		itemSelector: '.todo-list-li',

		template: template,

		autoRender: false,

		itemView: ListItemView,

		events: {
			'click .todo-list-filter-btn': 'onFilter',
			"click .todo-list-input-add-submit": "onAadBtnClick",
			'click .todo-list-li-link': 'openPopup',
			"change .todo-list-title": "saveTitle",
			"keypress .todo-list-title": "toAddInput",
			"keypress .todo-list-input-add": "createOnEnter"
		},

		listen: {
			'change collection': 'renderAllItems'
		},

		openPopup: function (e) {
			var that = this;
			var $li = this.$(e.currentTarget);
			var modelId = $li.closest('.todo-list-li').attr('data-itemId');

			var model = this.collection.get(modelId);

			var $modal = this.$('.modal');
			var $mBody = $modal.find('.modal-dialog').eq(0).html('');

			var modalView = new TodoItemView({
				container: $mBody,
				model: model
			});

			this.subview('item-' + modelId, modalView);

			this.listenTo(modalView, 'save', function () {
				model.save();
				$modal.modal('hide');
			});

			this.listenTo(modalView, 'remove', function () {
				if(confirm("Are You Sure To Remove ?")){
					$modal.modal('hide');
					setTimeout(function(){
						modalView.remove();
						model.destroy();
					}, 500);
				}
			});

			$modal.modal('show');
		},

		filterer: function (model, index) {
			var done = model.get('done');
			var result = true;
			var filter = this.collection.propModel.get('filter') || {};
			if (filter.done) {
				result = !!done;
			} else if (filter.active) {
				result = !done;
			}
			return result;
		},

		onFilter: function ( e ) {
			this.$('.todo-list-filter-btn').parent().removeClass('active');

			var $filter = this.$(e.currentTarget);
			$filter.parent().addClass('active');

			var filter = $filter.attr('data-filter');
			var _done = false;
			var _active = false;
			var $mainBtn = this.$('.todo-list-filter-main-btn');
			switch (filter) {
				case 'done':
					_done = true;
					$mainBtn.addClass('active');
					break;
				case 'active':
					_active = true;
					$mainBtn.addClass('active');
					break;
				default:
					$mainBtn.removeClass('active');
			}

			var _filter = {
				done: _done,
				active: _active
			};

			this.trigger('filter:change', _filter);
			this.collection.propModel.set('filter', _filter);
			this.renderAllItems();
		},

		initialize: function(){
			TodoLists.__super__.initialize.apply(this, arguments);
			this.render();
		},

		regions: {
			"todo-list/paginator": ".todo-list-line"
		},

		attach: function () {
			ListItemView.__super__.attach.apply(this, arguments);

			var that = this;

			this.$('.todo-list-title').val(this.collection.propModel.get("title"));
			this._initTitleInputStatus();

			var $l = this.$(".todo-list-l");
			var $trash = $l.parent().children('.todo-list-trash');

			$l.sortable({

				handle: ".todo-list-li-move",

				placeholder: "todo-list-li-placeholder",

				start: function () {
					$trash.addClass('active');
				},

				stop: function () {
					$trash.removeClass('active');
				},

				update: function(event, ui){
					var seq = [];
					$l.children(".todo-list-li").each(function(i){
						var $e = $(this);
						var m = that.collection.get($e.attr("data-itemId"));
						if(m != null){
							seq.push(m);
						}
					});
					that.updateSortOrder(seq);
					seq = [];
				}
			});
			$trash.droppable({
				accept: ".todo-list-li",
				hoverClass: "hover",
				drop: function( event, ui ) {
					var id = $(ui.helper[0]).attr('data-itemId');
					var m = that.collection.get(id).destroy();
				}
			});
		},

		updateSortOrder: function (seq) {
			_.each(seq, function(model, index){
				var order = +model.get('sortOrder');
				if (order !== index) {
					model.set('sortOrder', index);
					model.save();
				}
			});
			this.collection.sort();
		},

		//Создание элемента
		onAadBtnClick: function(){
			var $input = this.$(".todo-list-input-add");
			var title = ($input.val()||"").trim();

			if(!title){
				return;
			}

			var model = this.collection.create({
				sortOrder: this.collection.length,
				listId: this.collection.propModel.get("listId"),
				title: title
			});

			this.listenTo(model, 'sync', function () {
				this.renderAllItems();
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

		saveTitle: function(){
			this.collection.propModel.save({
				title: this._initTitleInputStatus()
			});
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