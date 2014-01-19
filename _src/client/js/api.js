define(function(require, exports, module){
    "use strict";

	var models = {

		'user': {
			server2client: function(response){
				return response;
			},
			client2server: function(model){
				return model.attributes;
			}
		},

		"todo-list": {
			server2client: function(response){
				var resp = {};
				resp["createDate"] = response["date_create"];
				resp["listId"] = +response["id"];
				resp["shared"] = !!parseInt(response["is_shared"], 10);
				resp["link"] = response["link"];
				resp["title"] = response["name"];
				resp["sortOrder"] = +response["sort_order"];
				return resp;
			},
			client2server: function(model){
				var req = {};
				req["date_create"] = model.get("createDate");
				req["id"] = model.get("listId");
				req["is_shared"] = model.get("shared") ? 1 : 0;
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
				req["is_active"] = !model.get("done") ? 1 : 0;
				req["link"] = model.get("link");
				req["name"] = model.get("title");
				req["sort_order"] = model.get("sortOrder");
				return req;
			}
		}
	};

	var defaultServer2client = function(resp){
//			console.warn('defaultServer2client');
			return resp;
		},
		defaultClient2server = function(model){
//			console.warn('defaultClient2server');
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