define(function(require){
    "use strict";

	var BaseModel = require('models/base/model');

    return BaseModel.extend({

		modelName: "todo-list",

        defaults: function(){

            return {
				shared: false,
				createDate: "",
				sortOrder: 0,
                isActive: false,
                title: ""
            };

        },

		idAttribute: "listId"

    });

});