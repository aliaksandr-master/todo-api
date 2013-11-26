define("FrameView",[

    "App",
    "jquery",
    "Backbone",
    "ListView",
    "ItemCollection",
    "ListCollection"

],function(App, $, bb, ListView, ItemCollection, ListCollection){
    "use strict";

    return bb.View.extend({

        template: window.JST['src/client/templates/app/FrameTemplate.hbs'],

        TodoLists:[],

        events: {
            "click .add-todo-btn": "addTodoListBtnClick",
            "click .todo-turn--left:not(.todo-turn--inactive)": "openTodoPrev",
            "click .todo-turn--right:not(.todo-turn--inactive)": "openTodoNext"
        },

        initialize: function(){
            var content = this.template({});
            this.lists = new ListCollection();
            this.$el.html(content);
            this.$wr = this.$(".todo-wr").eq(0);
            this.lists.fetch();
            this.lists.each(this.renderList, this);
            this.listenTo(this.lists, "add", this.addNewList, this);
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
            if(!id || !l){
                $leftTurn.addClass("todo-turn--inactive");
            }else{
                $leftTurn.removeClass("todo-turn--inactive");
            }
            if(id == l-1 || !l){
                $rightTurn.addClass("todo-turn--inactive");
            }else{
                $rightTurn.removeClass("todo-turn--inactive");
            }
            var oldId = this._currentTodo;
            if(l > 0){
                if(this.lists.length > this._currentTodo){
                    this.lists.at(this._currentTodo||0).trigger("setInactive");
                }
                if(this.lists.length > id){
                    this.lists.at(id).trigger("setActive");
                }
                this._currentTodo = id;

                App.route.navigate("/todo/"+id);
                // asd adfs df
            }
        },

        openTodoPrev: function(){
            this.setActive(this._currentTodo-1);
        },

        openTodoNext: function(){
            this.setActive(this._currentTodo+1);
        },
 // asd
        addNewList:function(model,index){
            this.renderList(model,index).focus();
        },

        renderList:function(model, index){

            var $el = $('<div class="todo todo--inactive todo--'+index+'" />').appendTo(this.$wr);

            var todo = new ListView({
                model: model,
                el: $el,
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