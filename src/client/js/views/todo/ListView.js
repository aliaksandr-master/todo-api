define("ListView",[

    'App',
    'jquery',
    "Backbone",
    "ItemView"

], function(App, $, bb, ItemView){
    "use strict";

    return bb.View.extend({

        template: window.JST['src/client/templates/todo/ListTemplate.hbs'],

        events: {
            "click .remove-todo-btn": "purgeThisTodoList",
            "click .todo-l-input-add-submit": "onAadBtnClick",
            "change .todo-l-title": "saveTitle",
            "keypress .todo-l-title": "toAddInput",
            "keypress .todo-l-input-add":  "createOnEnter"
        },

        initialize: function() {
            var that = this;

            console.log(this.model,arguments);

            this.$el.append(this.template({
                title: this.model.get("title")
            }));

            this.$input = this.$(".todo-l-input-add");

            this.$contentPlace = this.$(".todo-l");

            this._initTitleInputStatus();

            this.$contentPlace.sortable({

                handle: ".todo-li-move",

                update: function(event, ui){

                    that.$contentPlace.children().each(function(i){
                        var $e = $(this);
                        var modelId = $e.data("id");

                        var m = that.collection.findWhere({
                            id: modelId
                        });

                        if(m!=null){
                            m.save({
                                sort_order: i
                            });
                        }
                    });
                    that.collection.sort();
                }
            });

            this.collection.fetch();
            this.collection.each(this.renderRow, this);

            this.listenTo(this.collection, "add", this.addOneRow, this);

            this.listenTo(this.model,"setInactive", this.setInactive, this);
            this.listenTo(this.model,"setActive", this.setActive, this);
        },

        setActive:function(){
            this.model.set("isActive", true);
            this.$el.addClass("todo--active").removeClass("todo--inactive");
        },

        setInactive:function(){
            this.model.set("isActive", false);
            this.$el.addClass("todo--inactive").removeClass("todo--active");
        },

        focus:function(){
            var $input = this.$(".todo-l-title");
            setTimeout(function(){
                $input.focus();
            },100);
        },

        renderRow:function(model, index){
            model.set("sort_order",index);
            model.save();
            var view = new ItemView({
                model: model
            });
            view.render(this.$contentPlace);
        },

        //Добавление элемента списка
        addOneRow: function(model) {
            model.set("sort_order", this.collection.length);
            model.save();
            this.renderRow(model);
            return this;
        },

        //Создание элемента
        onAadBtnClick: function(){

            var title = (this.$input.val()||"").trim();

            if(!title){
                return;
            }

            this.collection.create({
                title: title
            });

            this.$input.val('');
        },

        purgeThisTodoList: function(){
            this.model.destroy();
            this.collection.each(function(model){
                model.destroy();
            });
            this.trigger("removeThis");
            this.remove();
        },

        createOnEnter: function(e) {
            if (e.keyCode == 13){
                this.onAadBtnClick();
            }
        },

        _initTitleInputStatus:function(){
            var $titleInput = this.$(".todo-l-title");
            var val = $titleInput.val().trim();
            if(val.length){
                $titleInput.removeClass("todo-l-title--empty");
            }else{
                $titleInput.addClass("todo-l-title--empty");
            }
            return val;
        },

        saveTitle: function(e){
            var val = this._initTitleInputStatus();
            this.model.set("title", val);
            this.model.save();
        },

        toAddInput: function(e){
            if(e.keyCode != 13 || !($(e.target).val()||"").trim()){
                return;
            }
            this.$input.focus();
        }
    });
});