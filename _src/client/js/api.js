define(function(require, exports, module){
    "use strict";

	var models = {

		"todo-list": {
			server2client: function(response){
				console.log("todo-list server2client");
				var resp = {};
				resp["createDate"] = response["date_create"];
				resp["listId"] = response["id"];
				resp["link"] = response["link"];
				resp["title"] = response["name"];
				resp["sortOrder"] = response["sort_order"];
				return resp;
			},
			client2server: function(model){
				console.log("todo-list client2server");
				var req = {};
				req["date_create"] = model.get("createDate");
				req["id"] = model.get("listId");
				req["link"] = model.get("link");
				req["name"] = model.get("title");
				req["sort_order"] = model.get("sortOrder");
				return req;
			}
		},

		"todo-list-item": {
			server2client: function(response){
				var resp = {};
				resp["createDate"] = response["date_create"];
				resp["listId"] = +response["todo_id"];
				resp["itemId"] = +response["id"];
				resp["title"] = response["name"];
				resp["sortOrder"] = +response["sort_order"];
				resp["done"] = !parseInt(response["is_active"],10);
				return resp;
			},
			client2server: function(model){
				var req = {};
				req["date_create"] = model.get("createDate");
				req["todo_id"] = model.get("listId");
				req["id"] = model.get("itemId");
				req["is_active"] = !model.get("done") * 1;
				req["link"] = model.get("link");
				req["name"] = model.get("title");
				req["sort_order"] = model.get("sortOrder");
				return req;
			}
		}
	};

	var defaultServer2client = function(resp){
			console.warn('defaultServer2client');
			return resp;
		},
		defaultClient2server = function(model){
			console.warn('defaultClient2server');
			return model.attributes;
		};

    return function(modelName){
		var obj = models[modelName] || {};
		return {
			client2server: obj.client2server || defaultClient2server,
			server2client: obj.server2client || defaultServer2client
		};
	};
});