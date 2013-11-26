define("ItemModel",[

    "Backbone"

],function(Backbone){
    "use strict";

    return Backbone.Model.extend({

        defaults: function() {
            return {
                title: "",
                description: "",
                id: this.storageID,
                done: 0
            };
        }

    });
});
