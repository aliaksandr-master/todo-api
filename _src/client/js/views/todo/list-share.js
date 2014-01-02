define(function(require, exports, module){
    "use strict";

	var BaseView = require('views/base/view');

	var template = require('templates/todo/list-share');
	var $= require('jquery');
	require('css!styles/todo/list-share');

    var TodoListShareView = BaseView.extend({

		events: {
			"change .todo-list-share-chk": "toggleShared",
			"click .todo-list-share-save": "saveShared"
		},

		bindings: {
			".todo-list-share-chk": "shared"
		},

		attach: function(){
			TodoListShareView.__super__.attach.apply(this, arguments);

			this.$(".todo-list-share-link").focus();
		},

		saveShared: function(){
			this.model.save();
			this.trigger("modelWasSaved");
		},

		toggleShared: function(el){
			var $wr = this.$(".todo-list-share-link-wr").eq(0);
			var $chk = this.$(".todo-list-share-chk").eq(0);
			if($chk.is(":checked")){
				$wr.addClass("-active");
				this.$(".todo-list-share-link").focus();
			}else{
				$wr.removeClass("-active");
			}
		},

		autoRender: true,
		template: template
	});

    return TodoListShareView;
});