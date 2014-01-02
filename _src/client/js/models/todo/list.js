define(function(require){
    "use strict";

	var BaseModel = require('models/base/model');

    return BaseModel.extend({

		url: function () {
			return "/" + this.get("listId");
		},

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