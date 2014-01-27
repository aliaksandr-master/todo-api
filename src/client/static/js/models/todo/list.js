define(function(require){
    "use strict";

	var BaseModel = require('models/base/model');

    return BaseModel.extend({

		toJSON: function(){
			var model = this;
			var req = {};
			req["date_create"] = model.get("createDate");
			req["id"] = model.get("listId");
			req["is_shared"] = model.get("shared") ? 1 : 0;
			req["link"] = model.get("link");
			req["name"] = model.get("title");
			req["sort_order"] = model.get("sortOrder");
			return req;
		},

		parse: function(response){
			var resp = {};
			resp["createDate"] = response["date_create"];
			resp["listId"] = +response["id"];
			resp["shared"] = !!parseInt(response["is_shared"], 10);
			resp["link"] = response["link"];
			resp["title"] = response["name"];
			resp["sortOrder"] = +response["sort_order"];
			return resp;
		},

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