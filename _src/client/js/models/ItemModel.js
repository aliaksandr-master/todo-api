define("ItemModel",function(require){
    "use strict";

	var bb = require('backbone');

    return bb.Model.extend({

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
