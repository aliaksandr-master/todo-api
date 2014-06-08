define(function(require){
    'use strict';

	var BaseModel = require('record/base/model');

	var _ = require('underscore');

    return BaseModel.extend({

		Name: 'TodoListItemModel',

		parse: function(response){
			var resp = {};
			resp["createDate"] = response["date_create"];
			resp["listId"] = +response["todo_id"];
			resp["itemId"] = +response["id"];
			resp["title"] = response["name"];
			resp["sortOrder"] = +response["sort_order"];
			resp["done"] = _.isString(response["is_active"]) ? !parseInt(response["is_active"],10) : !response["is_active"];
			return resp;
		},

		toJSON: function(){
			var model = this;
			var req = {};
			req["date_create"] = model.get("createDate");
			req["todo_id"] = model.get("listId");
			req["id"] = model.get("itemId");
			req["is_active"] = !model.get("done") ? 1 : 0;
			req["link"] = model.get("link");
			req["name"] = model.get("title");
			req["sort_order"] = model.get("sortOrder");
			return req;
		},

		defaults: {
			title: "",
			createDate: "",
			done: false,
			sortOrder: 0
		},

		idAttribute: "itemId"

    });
});
