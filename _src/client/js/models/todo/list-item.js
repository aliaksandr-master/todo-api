define(function(require){
    "use strict";

	var BaseModel = require('models/base/model');

    return BaseModel.extend({

		modelName: 'todo-list-item',

		defaults: {
			title: "",
			createDate: "",
			done: false,
			sortOrder: 0
		},

		idAttribute: "itemId"

    });
});
