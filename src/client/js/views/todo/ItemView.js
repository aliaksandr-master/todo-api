define("ItemView",[

    "App",
    "Backbone"

],function(App, bb){
    "use strict";

    var C_LI             = "todo-li";
    var C_LI_DONE        = "todo-li--done";
    var C_LI_META_ACTIVE = "todo-li--active";

    return bb.View.extend({

        //Шаблон элемента
        template: window.JST['src/client/templates/todo/ItemTemplate.hbs'],

        className: C_LI,

        //события
        events: {
            'click .todo-li-h': 'onToggleMeta',
            'click .todo-li-h-btn': 'onSaveMeta',
            'click .todo-li-btn-remove': 'clear',
            "click .todo-li-chc" : "toggleDone",
            "keypress .todo-li-dsc": "onDscKeyPress"
        },

        initialize: function() {
            this.listenTo(this.model, 'destroy', this.remove, this);
        },

        render: function($e) {
            var data = this.model.toJSON();
            var content = this.template(data);

            this.$el.html(content);
            this.$el.data("id", this.model.get("id"));
            if(data.done){
                this.$el.find(".todo-li-chc").attr("checked", "checked");
                this.$el.addClass(C_LI_DONE);
            }else{
                this.$el.removeClass(C_LI_DONE);
            }
            this.$el.appendTo($e);

            return this;
        },

        clear: function(){
            //Удаление модели элемента коллекции
            this.model.destroy();
        },
        onSaveMeta: function(){
            var title = this.$(".todo-li-h-input").val();
            var dsc = this.$(".todo-li-dsc").val().trim();

            this.model.set("description", dsc);
            this.model.set("title", title);
            this.model.save();

            this.$(".todo-li-h").html(title);

            this.$el.removeClass(C_LI_META_ACTIVE);
        },
        onToggleMeta: function(e){
            var title = this.model.get("title");
            this.$(".todo-li-h-input").val();
            this.$el.parent().children("."+C_LI).removeClass(C_LI_META_ACTIVE);
            this.$el.addClass(C_LI_META_ACTIVE);
        },

        onDscKeyPress:function(){
            this.$(".todo-li-dsc-mask").html(this.$(".todo-li-dsc").val().replace(/\n/g,"\n "));
        },

        toggleDone: function() {
            this.model.save({
                done: !this.model.get("done")
            });
            if(this.model.get("done")){
                this.$el.addClass(C_LI_DONE);
            }else{
                this.$el.removeClass(C_LI_DONE);
            }
            this.onSaveMeta();
        }
    });
});