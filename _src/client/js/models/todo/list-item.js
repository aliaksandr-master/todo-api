define(function(require){
    "use strict";

	var BaseModel = require('models/base/model');

    return BaseModel.extend({

		syncName: 'todo-list-item',

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
