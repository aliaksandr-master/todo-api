define(function(require){
    "use strict";

	var BaseModel = require('models/base/model');

    return BaseModel.extend({

        defaults: function() {
            return {
                title: "",
                description: "",
                done: 0,
				listId: null,
				itemId: null
            };
        },

		idAttribute: "itemId"

    });
});
