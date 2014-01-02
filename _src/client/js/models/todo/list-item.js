define(function(require){
    "use strict";

	var BaseModel = require('models/base/model');

    return BaseModel.extend({

		url: function(){
			return "/" + this.get("itemId");
		},

        defaults: function() {
            return {
                title: "",
                description: "",
                done: 0,
				sortOrder: null,
				listId: null,
				itemId: null
            };
        },

		idAttribute: "itemId"

    });
});
