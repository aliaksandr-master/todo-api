define(function(require){
    "use strict";

	var BaseModel = require('models/base/model');

    return BaseModel.extend({

		syncName: "todo-list",

        defaults: function(){

            return {
				shared: false,
				sortOrder: null,
                isActive: false,
                title: "",
                listId: null
            };

        },

		idAttribute: "listId"

    });

});