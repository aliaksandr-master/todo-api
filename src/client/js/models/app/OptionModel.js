define("OptionModel", [

    "Backbone"

],function(Backbone){
    "use strict";

    return Backbone.View.extend({

        defaults:function(){
            return {
                id: null,
                name: "",
                value: ""
            };
        }

    });

});