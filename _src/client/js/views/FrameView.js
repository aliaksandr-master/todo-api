define("FrameView", function(require, exports, module){
	"use strict";

	var App = require("App");
	var $ = require("jquery");
	var bb = require("Backbone");
	var ListView = require("ListView");
	var ItemCollection = require("ItemCollection");
	var ListCollection = require("ListCollection");

	var tpl = window.JST['_src/client/templates/FrameTemplate.hbs'];

	return bb.View.extend({

		events: {
			"click .add-todo-btn": "addTodoListBtnClick",
			"click .todo-turn--left:not(.todo-turn--inactive)": "openTodoPrev",
			"click .todo-turn--right:not(.todo-turn--inactive)": "openTodoNext"
		},

		initialize: function(){
			var content = tpl({});

			this.lists = new ListCollection();

			this.$el.html(content);
			this.$wr = this.$(".todo-wr").eq(0);

			this.listenTo(this.lists, "add", this.addNewList, this);
			this.lists.fetch();
			//			this.lists.each(this.renderList, this);
		},

		_currentTodo: 0,

		setActive:function(id){
			var l = this.lists.length;

			id = +id;
			id = id||0;
			id = l > id ? id : l-1;
			id = id < 0 ? 0 : id;

			var $turn = this.$(".todo-turn");
			var $leftTurn = $turn.filter(".todo-turn--left");
			var $rightTurn = $turn.filter(".todo-turn--right");

			//			console.log("FrameView set Active : ", id);

			if(!id || !l){
				$leftTurn.addClass("todo-turn--inactive");
			}else{
				$leftTurn.removeClass("todo-turn--inactive");
			}

			if(!l || (id === l-1)){
				$rightTurn.addClass("todo-turn--inactive");
			}else{
				$rightTurn.removeClass("todo-turn--inactive");
			}

			if(l > 0){
				if(this.lists.length > this._currentTodo){
					this.lists.at(this._currentTodo||0).trigger("setInactive");
				}

				if(this.lists.length > id){
					this.lists.at(id).trigger("setActive");
				}

				this._currentTodo = id;

				App.router.navigate("/todo/"+id);
				// asd adfs df
			}
		},

		openTodoPrev: function(){
			this.setActive(this._currentTodo-1);
		},

		openTodoNext: function(){
			this.setActive(this._currentTodo+1);
		},

		addNewList:function(model,index){
			this.renderList(model,index).focus();
		},

		renderList:function(model, index){

			var $el = $('<div class="todo todo--inactive todo--'+index+'" />').appendTo(this.$wr);

			var todo = new ListView({
				model: model,
				el: $el[0],
				collection: new ItemCollection({
					listId: model.get("listId")
				})
			});

			this.listenTo(todo, "removeThis", function(sort_order){
				this.setActive(this._currentTodo);
			}, this);

			return todo;
		},

		addTodoListBtnClick:function(){
			this.lists.create({
				listId: this.lists.length
			});
			this.setActive(this.lists.length);
		}

	});

});